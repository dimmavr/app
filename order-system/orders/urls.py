from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CustomerViewSet, ItemViewSet, OrderViewSet, OrderItemViewSet, PaymentViewSet

router = DefaultRouter()
router.register(r'customers', CustomerViewSet)
router.register(r'items', ItemViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'order-items', OrderItemViewSet)
router.register(r'payments', PaymentViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
