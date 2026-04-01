from django.core.cache import cache
from decimal import Decimal
from unittest.mock import MagicMock, patch

from django.contrib.auth.models import User
from rest_framework import status
from rest_framework.test import APITestCase
from django.urls import reverse

from .models import Category, Order, Product, SavedAddress
from .throttles import LoginEmailThrottle, LoginIPThrottle


class StoreApiTests(APITestCase):
    def setUp(self):
        cache.clear()
        self.category = Category.objects.create(name="electronics")
        self.product = Product.objects.create(
            name="Noise Cancelling Headphones",
            price=Decimal("149.99"),
            category=self.category,
            description="Wireless over-ear headphones",
            image="https://example.com/headphones.jpg",
            stock=10,
        )

    def register_and_login(self):
        register_response = self.client.post(
            reverse("register"),
            {
                "username": "john@example.com",
                "email": "john@example.com",
                "password": "StrongPass123!",
                "full_name": "John Doe",
            },
            format="json",
        )
        self.assertEqual(register_response.status_code, status.HTTP_201_CREATED)

        login_response = self.client.post(
            reverse("login"),
            {
                "email": "john@example.com",
                "password": "StrongPass123!",
            },
            format="json",
        )
        self.assertEqual(login_response.status_code, status.HTTP_200_OK)
        return login_response.data["access"]

    def test_register_login_and_profile_flow(self):
        access_token = self.register_and_login()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

        profile_response = self.client.get(reverse("profile"))
        self.assertEqual(profile_response.status_code, status.HTTP_200_OK)
        self.assertEqual(profile_response.data["email"], "john@example.com")

        update_response = self.client.patch(
            reverse("profile"),
            {
                "fullName": "John Updated",
                "phone": "9999999999",
                "address": "221B Baker Street",
            },
            format="json",
        )
        self.assertEqual(update_response.status_code, status.HTTP_200_OK)
        self.assertEqual(update_response.data["fullName"], "John Updated")

    def test_profile_requires_authentication(self):
        response = self.client.get(reverse("profile"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data["status_code"], status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data["error"], "unauthorized")

    def test_create_order_and_list_orders(self):
        access_token = self.register_and_login()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

        create_response = self.client.post(
            reverse("orders"),
            {
                "items": [
                    {
                        "product": self.product.id,
                        "quantity": 2,
                        "price": "149.99",
                    }
                ],
                "address": {
                    "fullName": "John Doe",
                    "house": "10",
                    "area": "MG Road",
                    "district": "Bengaluru",
                    "state": "Karnataka",
                    "pincode": "560001",
                    "phone": "9999999999",
                    "payment": "card",
                },
                "payment": "card",
            },
            format="json",
        )
        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Order.objects.count(), 1)
        self.assertEqual(create_response.data["items"][0]["name"], self.product.name)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 8)

        list_response = self.client.get(reverse("my-orders"))
        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(list_response.data), 1)
        self.assertEqual(list_response.data[0]["paymentMethod"], "card")
        self.assertEqual(str(list_response.data[0]["total"]), "333.98")

    def test_create_order_fails_when_requested_quantity_exceeds_stock(self):
        access_token = self.register_and_login()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

        create_response = self.client.post(
            reverse("orders"),
            {
                "items": [
                    {
                        "product": self.product.id,
                        "quantity": 11,
                        "price": "149.99",
                    }
                ],
                "address": {
                    "fullName": "John Doe",
                    "house": "10",
                    "area": "MG Road",
                    "district": "Bengaluru",
                    "state": "Karnataka",
                    "pincode": "560001",
                    "phone": "9999999999",
                },
                "payment": "card",
            },
            format="json",
        )

        self.assertEqual(create_response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("stock", str(create_response.data).lower())
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 10)

    def test_order_total_ignores_tampered_client_price(self):
        access_token = self.register_and_login()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

        create_response = self.client.post(
            reverse("orders"),
            {
                "items": [
                    {
                        "product": self.product.id,
                        "quantity": 2,
                        "price": "1.00",
                    }
                ],
                "address": {
                    "fullName": "John Doe",
                    "house": "10",
                    "area": "MG Road",
                    "district": "Bengaluru",
                    "state": "Karnataka",
                    "pincode": "560001",
                    "phone": "9999999999",
                },
                "payment": "cod",
            },
            format="json",
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(str(create_response.data["subtotal"]), "299.98")
        self.assertEqual(str(create_response.data["discount"]), "20.00")
        self.assertEqual(str(create_response.data["total"]), "333.98")
        self.assertEqual(str(create_response.data["items"][0]["price"]), "149.99")

    def test_user_can_create_and_select_saved_address_for_order(self):
        access_token = self.register_and_login()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

        address_response = self.client.post(
            reverse("addresses"),
            {
                "fullName": "John Doe",
                "phone": "9999999999",
                "line1": "10 MG Road",
                "line2": "Near Metro",
                "landmark": "Opposite Park",
                "city": "Bengaluru",
                "state": "Karnataka",
                "postalCode": "560001",
                "country": "India",
                "addressType": "home",
                "isDefault": True,
            },
            format="json",
        )
        self.assertEqual(address_response.status_code, status.HTTP_201_CREATED)

        create_response = self.client.post(
            reverse("orders"),
            {
                "items": [
                    {
                        "product": self.product.id,
                        "quantity": 1,
                    }
                ],
                "address_id": address_response.data["id"],
                "payment": "cod",
            },
            format="json",
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(create_response.data["address"]["city"], "Bengaluru")
        self.assertEqual(create_response.data["address"]["line1"], "10 MG Road")
        self.assertEqual(SavedAddress.objects.count(), 1)

    def test_order_can_save_new_address_for_future_use(self):
        access_token = self.register_and_login()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

        create_response = self.client.post(
            reverse("orders"),
            {
                "items": [
                    {
                        "product": self.product.id,
                        "quantity": 1,
                    }
                ],
                "address": {
                    "fullName": "John Doe",
                    "house": "10",
                    "area": "MG Road",
                    "district": "Bengaluru",
                    "state": "Karnataka",
                    "pincode": "560001",
                    "country": "India",
                    "phone": "9999999999",
                    "addressType": "home",
                },
                "payment": "cod",
                "save_address": True,
            },
            format="json",
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(SavedAddress.objects.count(), 1)
        saved_address = SavedAddress.objects.get()
        self.assertEqual(saved_address.line1, "10")
        self.assertEqual(saved_address.city, "Bengaluru")

    def test_order_snapshot_does_not_change_after_saved_address_update(self):
        access_token = self.register_and_login()
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {access_token}")

        address = SavedAddress.objects.create(
            user=User.objects.get(email="john@example.com"),
            full_name="John Doe",
            phone="9999999999",
            line1="10 MG Road",
            city="Bengaluru",
            state="Karnataka",
            postal_code="560001",
            country="India",
            address_type="home",
            is_default=True,
        )

        create_response = self.client.post(
            reverse("orders"),
            {
                "items": [
                    {
                        "product": self.product.id,
                        "quantity": 1,
                    }
                ],
                "address_id": address.id,
                "payment": "cod",
            },
            format="json",
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        order = Order.objects.get()
        self.assertEqual(order.shipping_address["line1"], "10 MG Road")

        patch_response = self.client.patch(
            reverse("address-detail", kwargs={"pk": address.id}),
            {
                "line1": "20 Residency Road",
            },
            format="json",
        )
        self.assertEqual(patch_response.status_code, status.HTTP_200_OK)

        order.refresh_from_db()
        self.assertEqual(order.shipping_address["line1"], "10 MG Road")

    def test_saved_address_list_requires_authentication(self):
        response = self.client.get(reverse("addresses"))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_is_rate_limited(self):
        original_ip_rate = getattr(LoginIPThrottle, "rate", None)
        original_email_rate = getattr(LoginEmailThrottle, "rate", None)
        LoginIPThrottle.rate = "2/min"
        LoginEmailThrottle.rate = "2/min"

        User.objects.create_user(
            username="locked@example.com",
            email="locked@example.com",
            password="StrongPass123!",
        )

        for _ in range(2):
            response = self.client.post(
                reverse("login"),
                {
                    "email": "locked@example.com",
                    "password": "WrongPassword123!",
                },
                format="json",
            )
            self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        try:
            throttled_response = self.client.post(
                reverse("login"),
                {
                    "email": "locked@example.com",
                    "password": "WrongPassword123!",
                },
                format="json",
            )
            self.assertEqual(throttled_response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)
        finally:
            LoginIPThrottle.rate = original_ip_rate
            LoginEmailThrottle.rate = original_email_rate

    def test_login_invalid_credentials_returns_unauthorized(self):
        User.objects.create_user(
            username="user@example.com",
            email="user@example.com",
            password="StrongPass123!",
        )

        response = self.client.post(
            reverse("login"),
            {
                "email": "user@example.com",
                "password": "WrongPassword123!",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data["status_code"], status.HTTP_401_UNAUTHORIZED)
        self.assertEqual(response.data["error"], "unauthorized")

    def test_missing_product_returns_not_found(self):
        response = self.client.get(reverse("product-detail", kwargs={"pk": 99999}))

        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["status_code"], status.HTTP_404_NOT_FOUND)
        self.assertEqual(response.data["error"], "not_found")

    @patch.dict("os.environ", {"GOOGLE_CLIENT_ID": "google-client-id"})
    @patch("store.serializers.urlopen")
    def test_google_auth_returns_jwt_tokens(self, mock_urlopen):
        mock_response = MagicMock()
        mock_response.read.return_value = (
            b'{"aud":"google-client-id","email":"google@example.com","email_verified":"true","name":"Google User","picture":"https://example.com/pic.png"}'
        )
        mock_urlopen.return_value.__enter__.return_value = mock_response

        response = self.client.post(
            reverse("google-auth"),
            {
                "credential": "fake-google-token",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["email"], "google@example.com")
