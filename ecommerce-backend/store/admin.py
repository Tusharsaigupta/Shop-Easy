from django.contrib import admin
from .models import Category, Product, ProductImage, ProductMeta, SavedAddress


class ProductImageInline(admin.TabularInline):
    model = ProductImage
    extra = 1


class ProductMetaInline(admin.StackedInline):
    model = ProductMeta
    extra = 0
    max_num = 1


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "category", "price", "stock", "rating"]
    list_filter = ["category"]
    search_fields = ["name", "description", "category__name"]
    inlines = [ProductMetaInline, ProductImageInline]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ["id", "name"]
    search_fields = ["name"]


@admin.register(ProductImage)
class ProductImageAdmin(admin.ModelAdmin):
    list_display = ["id", "product", "image"]
    search_fields = ["product__name", "image"]


@admin.register(ProductMeta)
class ProductMetaAdmin(admin.ModelAdmin):
    list_display = ["id", "product"]
    search_fields = ["product__name"]


@admin.register(SavedAddress)
class SavedAddressAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "full_name", "city", "state", "address_type", "is_default"]
    list_filter = ["address_type", "is_default", "country"]
    search_fields = ["user__email", "full_name", "phone", "city", "state", "postal_code"]
