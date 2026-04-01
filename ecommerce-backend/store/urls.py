from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    CategoryListView,
    GoogleAuthView,
    LoginView,
    OrderCreateView,
    OrderListView,
    ProductDetailView,
    ProductListView,
    ProfileView,
    RegisterView,
    SavedAddressDetailView,
    SavedAddressListCreateView,
)

urlpatterns = [
    path('products/', ProductListView.as_view(), name='products'),
    path('products/<int:pk>/', ProductDetailView.as_view(), name='product-detail'),
    path('category/', CategoryListView.as_view(), name='categories'),
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('google-auth/', GoogleAuthView.as_view(), name='google-auth'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('profile/', ProfileView.as_view(), name='profile'),
    path('addresses/', SavedAddressListCreateView.as_view(), name='addresses'),
    path('addresses/<int:pk>/', SavedAddressDetailView.as_view(), name='address-detail'),
    path('orders/', OrderCreateView.as_view(), name='orders'),
    path('my-orders/', OrderListView.as_view(), name='my-orders'),
]
