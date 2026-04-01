from django.contrib.auth.models import User
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Category, Order, Product, UserProfile
from .serializers import (
    CategorySerializer,
    EmailTokenObtainPairSerializer,
    GoogleAuthSerializer,
    OrderCreateSerializer,
    OrderSerializer,
    ProductSerializer,
    RegisterSerializer,
    SavedAddressSerializer,
    UserProfileSerializer,
    UserSummarySerializer,
)
from .throttles import (
    LoginEmailThrottle,
    LoginIPThrottle,
    OrderWriteThrottle,
    ProfileWriteThrottle,
)


class ProductListView(generics.ListAPIView):
    queryset = Product.objects.all().select_related("category").prefetch_related("images")
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    throttle_classes = []


class ProductDetailView(generics.RetrieveAPIView):
    queryset = Product.objects.all().select_related("category").prefetch_related("images")
    serializer_class = ProductSerializer
    permission_classes = [AllowAny]
    throttle_classes = []


class CategoryListView(generics.ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    permission_classes = [AllowAny]
    throttle_classes = []


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        profile, _ = UserProfile.objects.get_or_create(user=user)

        return Response(
            {
                "message": "User registered successfully.",
                "user": UserSummarySerializer(user).data,
                "profile": UserProfileSerializer(profile).data,
            },
            status=status.HTTP_201_CREATED,
        )


class LoginView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [LoginIPThrottle, LoginEmailThrottle]

    def post(self, request):
        serializer = EmailTokenObtainPairSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class GoogleAuthView(APIView):
    permission_classes = [AllowAny]
    throttle_classes = [LoginIPThrottle]

    def post(self, request):
        serializer = GoogleAuthSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response(serializer.validated_data, status=status.HTTP_200_OK)


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = UserProfile.objects.get_or_create(
            user=request.user,
            defaults={"full_name": request.user.username},
        )
        return Response(UserProfileSerializer(profile).data)

    def patch(self, request):
        self.throttle_classes = [ProfileWriteThrottle]
        self.check_throttles(request)
        profile, _ = UserProfile.objects.get_or_create(
            user=request.user,
            defaults={"full_name": request.user.username},
        )
        serializer = UserProfileSerializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class OrderCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderCreateSerializer
    throttle_classes = [OrderWriteThrottle]


class OrderListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = OrderSerializer

    def get_queryset(self):
        return (
            Order.objects.filter(user=self.request.user)
            .prefetch_related("items__product")
            .order_by("-created_at")
        )


class SavedAddressListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SavedAddressSerializer

    def get_queryset(self):
        return self.request.user.saved_addresses.all()

    def get_throttles(self):
        if self.request.method in {"POST"}:
            return [ProfileWriteThrottle()]
        return []


class SavedAddressDetailView(generics.RetrieveUpdateDestroyAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SavedAddressSerializer

    def get_queryset(self):
        return self.request.user.saved_addresses.all()

    def get_throttles(self):
        if self.request.method in {"PATCH", "PUT", "DELETE"}:
            return [ProfileWriteThrottle()]
        return []
