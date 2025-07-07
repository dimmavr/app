from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (CustomerViewSet, DashboardViewSet, ItemViewSet,
                    OrderItemViewSet, OrderViewSet, PaymentViewSet,
                    change_password, register_user)

router = DefaultRouter()
router.register(r'customers', CustomerViewSet)
router.register(r'items', ItemViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'order-items', OrderItemViewSet)
router.register(r'payments', PaymentViewSet)
router.register(r'dashboard', DashboardViewSet, basename='dashboard')  # 🔹 ΠΡΟΣΟΧΗ σε αυτό!

urlpatterns = [
    path('', include(router.urls)),
    path('change-password/', change_password),
    path('register/', register_user),
]
