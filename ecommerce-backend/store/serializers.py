from decimal import Decimal
import os
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode
from urllib.request import urlopen

from django.contrib.auth.models import User
from django.core.exceptions import ValidationError as DjangoValidationError
from django.contrib.auth.password_validation import validate_password
from django.db import transaction
from rest_framework import serializers
from rest_framework.exceptions import AuthenticationFailed
from rest_framework_simplejwt.tokens import RefreshToken

from .models import (
    Category,
    Order,
    OrderItem,
    Product,
    ProductImage,
    ProductMeta,
    SavedAddress,
    UserProfile,
)


class ProductImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductImage
        fields = ["image"]


class ProductMetaSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductMeta
        fields = ["highlights", "specifications"]


class ProductSerializer(serializers.ModelSerializer):
    images = ProductImageSerializer(many=True, read_only=True)
    meta = ProductMetaSerializer(read_only=True)
    category_name = serializers.CharField(source="category.name", read_only=True)

    class Meta:
        model = Product
        fields = [
            "id",
            "name",
            "price",
            "category",
            "category_name",
            "description",
            "rating",
            "image",
            "stock",
            "images",
            "meta",
        ]


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = "__all__"


class UserProfileSerializer(serializers.ModelSerializer):
    email = serializers.EmailField(source="user.email", read_only=True)
    username = serializers.CharField(source="user.username", read_only=True)
    fullName = serializers.CharField(source="full_name", required=False, allow_blank=True)
    profilePic = serializers.CharField(source="profile_pic", required=False, allow_blank=True)

    class Meta:
        model = UserProfile
        fields = [
            "email",
            "username",
            "fullName",
            "phone",
            "address",
            "profilePic",
        ]

    def update(self, instance, validated_data):
        instance.full_name = validated_data.get("full_name", instance.full_name)
        instance.phone = validated_data.get("phone", instance.phone)
        instance.address = validated_data.get("address", instance.address)
        instance.profile_pic = validated_data.get("profile_pic", instance.profile_pic)
        instance.save()
        return instance


class SavedAddressSerializer(serializers.ModelSerializer):
    fullName = serializers.CharField(source="full_name")
    line1 = serializers.CharField()
    line2 = serializers.CharField(required=False, allow_blank=True)
    postalCode = serializers.CharField(source="postal_code")
    addressType = serializers.ChoiceField(
        source="address_type",
        choices=SavedAddress.ADDRESS_TYPE_CHOICES,
        required=False,
    )
    isDefault = serializers.BooleanField(source="is_default", required=False)
    createdAt = serializers.DateTimeField(source="created_at", read_only=True)
    updatedAt = serializers.DateTimeField(source="updated_at", read_only=True)

    class Meta:
        model = SavedAddress
        fields = [
            "id",
            "fullName",
            "phone",
            "line1",
            "line2",
            "landmark",
            "city",
            "state",
            "postalCode",
            "country",
            "addressType",
            "isDefault",
            "createdAt",
            "updatedAt",
        ]

    def validate_postalCode(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Postal code is required.")
        return value

    def validate_phone(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError("Phone is required.")
        return value

    def _update_default_address(self, instance):
        if instance.is_default:
            SavedAddress.objects.filter(user=instance.user).exclude(pk=instance.pk).update(
                is_default=False
            )
        elif not SavedAddress.objects.filter(user=instance.user, is_default=True).exists():
            instance.is_default = True
            instance.save(update_fields=["is_default"])

    def create(self, validated_data):
        user = self.context["request"].user
        if not SavedAddress.objects.filter(user=user).exists():
            validated_data.setdefault("is_default", True)

        instance = SavedAddress.objects.create(user=user, **validated_data)
        self._update_default_address(instance)
        return instance

    def update(self, instance, validated_data):
        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()
        self._update_default_address(instance)
        return instance


class UserSummarySerializer(serializers.ModelSerializer):
    fullName = serializers.SerializerMethodField()
    profilePic = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ["id", "username", "email", "fullName", "profilePic"]

    def get_fullName(self, obj):
        return getattr(obj.profile, "full_name", "") or obj.username

    def get_profilePic(self, obj):
        return getattr(obj.profile, "profile_pic", "")


class RegisterSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(write_only=True, required=False, allow_blank=True)

    class Meta:
        model = User
        fields = ["username", "email", "password", "full_name"]
        extra_kwargs = {"password": {"write_only": True}}

    def validate(self, attrs):
        email = attrs.get("email", "").strip().lower()
        username = attrs.get("username", "").strip() or email
        password = attrs.get("password", "")

        if not email:
            raise serializers.ValidationError({"email": "Email is required."})

        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError({"email": "A user with this email already exists."})

        if User.objects.filter(username__iexact=username).exists():
            raise serializers.ValidationError({"username": "This username is already taken."})

        try:
            validate_password(password)
        except DjangoValidationError as exc:
            raise serializers.ValidationError({"password": list(exc.messages)}) from exc

        attrs["email"] = email
        attrs["username"] = username
        return attrs

    def create(self, validated_data):
        full_name = validated_data.pop("full_name", "")
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user, full_name=full_name)
        return user


class EmailTokenObtainPairSerializer(serializers.Serializer):
    email = serializers.EmailField(write_only=True)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = attrs.get("email", "").strip().lower()
        password = attrs.get("password")

        if not email or not password:
            raise serializers.ValidationError("Email and password are required.")

        try:
            user = User.objects.get(email__iexact=email)
        except User.DoesNotExist as exc:
            raise AuthenticationFailed("Invalid email or password.") from exc

        if not user.check_password(password):
            raise AuthenticationFailed("Invalid email or password.")

        refresh = RefreshToken.for_user(user)
        self.user = user
        data = {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserSummarySerializer(user).data,
        }
        return data


class GoogleAuthSerializer(serializers.Serializer):
    credential = serializers.CharField(write_only=True)

    def validate(self, attrs):
        credential = attrs.get("credential", "").strip()
        client_id = os.environ.get("GOOGLE_CLIENT_ID", "").strip()

        if not credential:
            raise serializers.ValidationError({"credential": ["Google credential is required."]})

        if not client_id:
            raise serializers.ValidationError(
                {"google": ["Google authentication is not configured on the server."]}
            )

        query = urlencode({"id_token": credential})
        url = f"https://oauth2.googleapis.com/tokeninfo?{query}"

        try:
            with urlopen(url, timeout=10) as response:
                payload = response.read().decode("utf-8")
        except (HTTPError, URLError) as exc:
            raise AuthenticationFailed("Unable to verify Google account.") from exc

        import json

        try:
            google_data = json.loads(payload)
        except json.JSONDecodeError as exc:
            raise AuthenticationFailed("Invalid response from Google.") from exc

        if google_data.get("aud") != client_id:
            raise AuthenticationFailed("Google client mismatch.")

        email = (google_data.get("email") or "").strip().lower()
        if not email or google_data.get("email_verified") != "true":
            raise AuthenticationFailed("Google account email is not verified.")

        full_name = (google_data.get("name") or "").strip()
        picture = (google_data.get("picture") or "").strip()

        user, created = User.objects.get_or_create(
            email=email,
            defaults={
                "username": email,
                "first_name": full_name,
            },
        )

        if created:
            user.set_unusable_password()
            user.save(update_fields=["password"])

        profile, _ = UserProfile.objects.get_or_create(user=user)
        updates = []

        if full_name and profile.full_name != full_name:
            profile.full_name = full_name
            updates.append("full_name")

        if picture and profile.profile_pic != picture:
            profile.profile_pic = picture
            updates.append("profile_pic")

        if updates:
            profile.save(update_fields=updates)

        refresh = RefreshToken.for_user(user)
        return {
            "refresh": str(refresh),
            "access": str(refresh.access_token),
            "user": UserSummarySerializer(user).data,
        }


class OrderItemWriteSerializer(serializers.Serializer):
    product = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all())
    quantity = serializers.IntegerField(min_value=1)
    price = serializers.DecimalField(
        max_digits=10,
        decimal_places=2,
        required=False,
        write_only=True,
    )


class OrderItemReadSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(source="product.id", read_only=True)
    name = serializers.CharField(source="product_name", read_only=True)
    image = serializers.CharField(source="product_image", read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product", "name", "image", "quantity", "price"]


class OrderSerializer(serializers.ModelSerializer):
    items = serializers.SerializerMethodField(read_only=True)
    date = serializers.DateTimeField(source="created_at", read_only=True)
    address = serializers.JSONField(source="shipping_address", read_only=True)
    paymentMethod = serializers.CharField(source="payment_method", read_only=True)
    line_items = OrderItemWriteSerializer(many=True, write_only=True, required=False)

    class Meta:
        model = Order
        fields = [
            "id",
            "user",
            "date",
            "created_at",
            "status",
            "paymentMethod",
            "address",
            "subtotal",
            "tax",
            "delivery_fee",
            "discount",
            "total",
            "items",
            "line_items",
        ]
        read_only_fields = [
            "user",
            "created_at",
            "items",
            "subtotal",
            "tax",
            "delivery_fee",
            "discount",
            "total",
        ]

    def get_items(self, obj):
        return OrderItemReadSerializer(obj.items.all(), many=True).data


class OrderCreateSerializer(serializers.Serializer):
    items = OrderItemWriteSerializer(many=True)
    address = serializers.JSONField(required=False)
    address_id = serializers.PrimaryKeyRelatedField(
        queryset=SavedAddress.objects.none(),
        required=False,
        allow_null=True,
    )
    payment = serializers.ChoiceField(choices=["cod", "upi", "card"])
    save_address = serializers.BooleanField(required=False, default=False)

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request and request.user and request.user.is_authenticated:
            self.fields["address_id"].queryset = SavedAddress.objects.filter(user=request.user)

    def validate(self, attrs):
        if not attrs["items"]:
            raise serializers.ValidationError({"items": ["At least one item is required."]})
        if not attrs.get("address") and not attrs.get("address_id"):
            raise serializers.ValidationError(
                {"address": ["Provide either a saved address or a new address."]}
            )
        return attrs

    def validate_items(self, items):
        requested_quantities = {}

        for item in items:
            product = item["product"]
            requested_quantities[product.id] = (
                requested_quantities.get(product.id, 0) + item["quantity"]
            )

        insufficient_stock = []
        for item in items:
            product = item["product"]
            requested_quantity = requested_quantities[product.id]
            if requested_quantity > product.stock:
                insufficient_stock.append(
                    f"{product.name} only has {product.stock} item(s) in stock."
                )

        if insufficient_stock:
            raise serializers.ValidationError(insufficient_stock)

        return items

    def create(self, validated_data):
        request = self.context["request"]
        items_data = validated_data["items"]
        address = validated_data.get("address")
        address_id = validated_data.get("address_id")
        payment = validated_data["payment"]
        save_address = validated_data.get("save_address", False)

        if address_id:
            address_snapshot = SavedAddressSerializer(address_id).data
        else:
            address_snapshot = self._build_address_snapshot(address)

        subtotal = sum(
            Decimal(str(item["product"].price)) * item["quantity"]
            for item in items_data
        )
        tax = subtotal * Decimal("0.18")
        delivery_fee = Decimal("0.00") if subtotal > Decimal("50") else Decimal("5.00")
        discount = Decimal("20.00") if subtotal > Decimal("200") else Decimal("0.00")
        total = subtotal + tax + delivery_fee - discount

        with transaction.atomic():
            requested_quantities = {}
            for item in items_data:
                product_id = item["product"].id
                requested_quantities[product_id] = (
                    requested_quantities.get(product_id, 0) + item["quantity"]
                )

            locked_products = {
                product.id: product
                for product in Product.objects.select_for_update().filter(
                    id__in=requested_quantities.keys()
                )
            }

            for product_id, requested_quantity in requested_quantities.items():
                product = locked_products[product_id]
                if requested_quantity > product.stock:
                    raise serializers.ValidationError(
                        {
                            "items": [
                                f"{product.name} only has {product.stock} item(s) in stock."
                            ]
                        }
                    )

            order = Order.objects.create(
                user=request.user,
                payment_method=payment,
                shipping_address=address_snapshot,
                status="Paid" if payment in {"upi", "card"} else "Placed",
                subtotal=subtotal.quantize(Decimal("0.01")),
                tax=tax.quantize(Decimal("0.01")),
                delivery_fee=delivery_fee.quantize(Decimal("0.01")),
                discount=discount.quantize(Decimal("0.01")),
                total=total.quantize(Decimal("0.01")),
            )

            if save_address and address and not address_id:
                address_serializer = SavedAddressSerializer(
                    data=self._build_saved_address_payload(address_snapshot),
                    context=self.context,
                )
                address_serializer.is_valid(raise_exception=True)
                address_serializer.save()

            for item in items_data:
                product = locked_products[item["product"].id]
                OrderItem.objects.create(
                    order=order,
                    product=product,
                    quantity=item["quantity"],
                    price=Decimal(str(product.price)).quantize(Decimal("0.01")),
                    product_name=product.name,
                    product_image=product.image,
                )
                product.stock -= item["quantity"]
                product.save(update_fields=["stock"])

        return order

    def to_representation(self, instance):
        return OrderSerializer(instance, context=self.context).data

    def _build_address_snapshot(self, address):
        return {
            "fullName": (address.get("fullName") or "").strip(),
            "phone": (address.get("phone") or "").strip(),
            "line1": (address.get("line1") or address.get("house") or "").strip(),
            "line2": (address.get("line2") or "").strip(),
            "landmark": (address.get("landmark") or "").strip(),
            "city": (address.get("city") or address.get("district") or "").strip(),
            "state": (address.get("state") or "").strip(),
            "postalCode": (address.get("postalCode") or address.get("pincode") or "").strip(),
            "country": (address.get("country") or "India").strip(),
            "addressType": (address.get("addressType") or "home").strip().lower(),
            "house": (address.get("house") or "").strip(),
            "area": (address.get("area") or "").strip(),
            "district": (address.get("district") or "").strip(),
            "pincode": (address.get("pincode") or "").strip(),
            "phoneCode": (address.get("phoneCode") or "").strip(),
            "payment": (address.get("payment") or "").strip(),
        }

    def _build_saved_address_payload(self, address_snapshot):
        return {
            "fullName": address_snapshot["fullName"],
            "phone": address_snapshot["phone"],
            "line1": address_snapshot["line1"],
            "line2": address_snapshot["line2"],
            "landmark": address_snapshot["landmark"],
            "city": address_snapshot["city"],
            "state": address_snapshot["state"],
            "postalCode": address_snapshot["postalCode"],
            "country": address_snapshot["country"],
            "addressType": address_snapshot["addressType"] or "home",
            "isDefault": False,
        }
