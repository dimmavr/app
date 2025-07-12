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
    customer_name = serializers.SerializerMethodField()

    def get_customer_name(self, obj):
        return f"{obj.order.customer.first_name} {obj.order.customer.last_name}"

    class Meta:
        model = Payment
        fields = ['id', 'order', 'amount', 'date', 'customer_name']


class OrderItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['id', 'order', 'item', 'quantity']

class OrderItemInlineSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ['item', 'quantity']

class OrderSerializer(serializers.ModelSerializer):
    customer = CustomerSerializer(read_only=True)
    customer_name = serializers.SerializerMethodField()
    total_amount = serializers.SerializerMethodField()
    paid_amount = serializers.SerializerMethodField()
    remaining_amount = serializers.SerializerMethodField()
    is_paid = serializers.SerializerMethodField()
    items = OrderItemSerializer(many=True, read_only=True)
    payments = PaymentSerializer(many=True, read_only=True)
   

    class Meta:
        model = Order
        fields = [
            'id',
            'customer',
            'customer_name',
            'date',
            'items',
            'payments',
            'total_amount',
            
            'paid_amount',
            'remaining_amount',
            'is_paid'
        ]

    def get_customer_name(self, obj):
        return f"{obj.customer.first_name} {obj.customer.last_name}"

    def get_total_amount(self, obj):
        return obj.total_amount()

    def get_paid_amount(self, obj):
        return obj.paid_amount()

    def get_remaining_amount(self, obj):
        return obj.remaining_amount()

    def get_is_paid(self, obj):
        return obj.is_paid()

    def create(self, validated_data):
        request = self.context.get('request')
        items_data = request.data.get('items', [])
        customer_id = request.data.get('customer')  # <- παίρνουμε το id απευθείας
        customer = Customer.objects.get(id=customer_id)

        order = Order.objects.create(customer=customer)

        for item_data in items_data:
            OrderItem.objects.create(
                 order=order,
                 item_id=item_data['item'],
                quantity=item_data['quantity']
           )

        return order

   
