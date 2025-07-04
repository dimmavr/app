from django.contrib import admin
from django.db import router
from .models import Customer, Item, Order, OrderItem, Payment
from .views import CustomerViewSet, ItemViewSet, OrderViewSet, OrderItemViewSet, PaymentViewSet
from django.urls import path, include
from rest_framework.routers import DefaultRouter

admin.site.register(Customer)
admin.site.register(Item)
admin.site.register(Order)
admin.site.register(OrderItem)
admin.site.register(Payment)

