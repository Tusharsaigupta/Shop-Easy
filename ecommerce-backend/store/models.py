from decimal import Decimal

from django.contrib.auth.models import User
from django.db import models

# CATEGORY (same)
class Category(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


# PRODUCT
class Product(models.Model):
    name = models.CharField(max_length=200)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    category = models.ForeignKey(Category, on_delete=models.CASCADE)
    description = models.TextField(blank=True)
    rating = models.FloatField(default=0)  # ✅ NEW
    image = models.URLField()  # main image (keep it)
    stock = models.PositiveIntegerField(default=25)

    def __str__(self):
        return self.name


class UserProfile(models.Model):
    user = models.OneToOneField(
        User,
        related_name="profile",
        on_delete=models.CASCADE,
    )
    full_name = models.CharField(max_length=255, blank=True)
    phone = models.CharField(max_length=30, blank=True)
    address = models.TextField(blank=True)
    profile_pic = models.TextField(blank=True)

    def __str__(self):
        return self.full_name or self.user.email or self.user.username


class SavedAddress(models.Model):
    ADDRESS_TYPE_HOME = "home"
    ADDRESS_TYPE_WORK = "work"
    ADDRESS_TYPE_OTHER = "other"

    ADDRESS_TYPE_CHOICES = [
        (ADDRESS_TYPE_HOME, "Home"),
        (ADDRESS_TYPE_WORK, "Work"),
        (ADDRESS_TYPE_OTHER, "Other"),
    ]

    user = models.ForeignKey(
        User,
        related_name="saved_addresses",
        on_delete=models.CASCADE,
    )
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=30)
    line1 = models.CharField(max_length=255)
    line2 = models.CharField(max_length=255, blank=True)
    landmark = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default="India")
    address_type = models.CharField(
        max_length=20,
        choices=ADDRESS_TYPE_CHOICES,
        default=ADDRESS_TYPE_HOME,
    )
    is_default = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-is_default", "-updated_at", "-created_at"]

    def __str__(self):
        return f"{self.full_name} ({self.city})"


# MULTIPLE IMAGES
class ProductImage(models.Model):
    product = models.ForeignKey(
        Product,
        related_name="images",
        on_delete=models.CASCADE
    )
    image = models.URLField()

    def __str__(self):
        return self.product.name


# HIGHLIGHTS + SPECIFICATIONS
class ProductMeta(models.Model):
    product = models.OneToOneField(
        Product,
        related_name="meta",
        on_delete=models.CASCADE
    )
    highlights = models.JSONField(default=list)
    specifications = models.JSONField(default=dict)

    def __str__(self):
        return self.product.name

# Order Model  
class Order(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50, default="Placed")
    payment_method = models.CharField(max_length=30, default="cod")
    shipping_address = models.JSONField(default=dict, blank=True)
    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    tax = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    delivery_fee = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    discount = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
    )
    total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal("0.00"),
    )

    def __str__(self):
        return f"Order {self.id} by {self.user.username}"
    
class OrderItem(models.Model):
    order = models.ForeignKey(Order, related_name='items', on_delete=models.CASCADE)
    product = models.ForeignKey(Product, on_delete=models.CASCADE)
    quantity = models.IntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    product_name = models.CharField(max_length=200)
    product_image = models.URLField(blank=True)

    def __str__(self):
        return f"{self.product.name} (x{self.quantity})"
