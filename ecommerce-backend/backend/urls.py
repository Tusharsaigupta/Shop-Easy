from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse


def api_root(request):
    return JsonResponse(
        {
            "message": "Shop Easy backend is running.",
            "admin": "/admin/",
            "api": "/api/",
            "products": "/api/products/",
        }
    )

urlpatterns = [
    path('', api_root, name='api-root'),
    path('admin/', admin.site.urls),
    path('api/', include('store.urls')),
]
