from rest_framework import serializers

from .models import Customer, Item, Order, OrderItem, Payment


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model=Customer
        fields='__all__'


class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model=Item
        fields='__all__'
        
class OrderItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'item', 'quantity']


class OrderItemSerializer(serializers.ModelSerializer):
    item = ItemSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id', 'item', 'quantity', 'total_price']


class PaymentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Payment
        fields = '__all__'

class OrderItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'item', 'quantity']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
    total_amount = serializers.SerializerMethodField()
    paid_amount = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()
    is_paid = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = [
            'id',
            'customer',
            'date',
            'items',
            'payments',
            'total_amount',
            'paid_amount',
            'remaining_amount',
            'is_paid'
        ]

    def get_total_amount(self, obj):
        return obj.total_amount()

    def get_paid_amount(self, obj):
        return obj.paid_amount()

    def get_remaining_amount(self, obj):
        return obj.remaining_amount()

    def get_is_paid(self, obj):
        return obj.is_paid()
