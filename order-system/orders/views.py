import datetime

from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters, viewsets
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.viewsets import ViewSet

from .models import Customer, Item, Order, OrderItem, Payment
from .serializers import (CustomerSerializer, ItemSerializer,
                          OrderItemCreateSerializer, OrderItemSerializer,
                          OrderSerializer, PaymentSerializer)


class CustomerViewSet(viewsets.ModelViewSet):
    queryset = Customer.objects.all()
    serializer_class = CustomerSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['first_name', 'last_name', 'phone', 'tax_id']
    filterset_fields = ['first_name', 'last_name', 'phone', 'tax_id']

    @action(detail=True, methods=['get'])
    def debt(self, request, pk=None):
        try:
            customer = Customer.objects.get(pk=pk)
        except Customer.DoesNotExist:
            return Response({"error": "Ο πελάτης δεν βρέθηκε"}, status=404)

        orders = Order.objects.filter(customer=customer)
        total_orders = sum(order.total_amount() for order in orders)
        payments = Payment.objects.filter(order__customer=customer)
        total_paid = sum(payment.amount for payment in payments)
        remaining = total_orders - total_paid

        return Response({
            "customer": f"{customer.first_name} {customer.last_name}",
            "total_orders": total_orders,
            "total_paid": total_paid,
            "debt": remaining
        })


class ItemViewSet(viewsets.ModelViewSet):
    queryset = Item.objects.all()
    serializer_class = ItemSerializer
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ['name', 'description']
    filterset_fields = ['name']

    @action(detail=False, methods=['get'])
    def top_selling(self, request):
        stats = {}
        for oi in OrderItem.objects.all():
            name = oi.item.name
            stats[name] = stats.get(name, 0) + oi.quantity
        top = sorted(stats.items(), key=lambda x: x[1], reverse=True)[:5]
        return Response({k: v for k, v in top})

    @action(detail=False, methods=['get'])
    def sold_by_date(self, request):
        date_str = request.query_params.get('date')
        if not date_str:
            return Response({"error": "Δώσε ημερομηνία με ?date=YYYY-MM-DD"}, status=400)
        try:
            date_obj = datetime.datetime.strptime(date_str, "%Y-%m-%d").date()
        except:
            return Response({"error": "Λάθος μορφή ημερομηνίας"}, status=400)

        items_today = OrderItem.objects.filter(order__date=date_obj)
        result = {}
        for item in items_today:
            name = item.item.name
            result[name] = result.get(name, 0) + item.quantity
        return Response(result)


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['customer', 'date']
    search_fields = ['customer__first_name', 'customer__last_name']

    @action(detail=False, methods=['get'])
    def today(self, request):
        today_date = datetime.date.today()
        todays_orders = Order.objects.filter(date=today_date)
        serializer = self.get_serializer(todays_orders, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def summary(self, request, pk=None):
        try:
            order = Order.objects.get(pk=pk)
        except Order.DoesNotExist:
            return Response({"error": "Η παραγγελία δεν βρέθηκε"}, status=404)

        items_data = [{
            "item": i.item.name,
            "quantity": i.quantity,
            "price": i.price
        } for i in order.items.all()]

        payments_data = [{
            "amount": p.amount,
            "date": p.date
        } for p in order.payments.all()]

        return Response({
            "order_id": order.id,
            "customer": f"{order.customer.first_name} {order.customer.last_name}",
            "date": order.date,
            "total_amount": order.total_amount(),
            "paid_amount": order.paid_amount(),
            "remaining_amount": order.remaining_amount(),
            "is_paid": order.is_paid(),
            "items": items_data,
            "payments": payments_data
        })


class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.all()
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['order', 'item', 'order__date']

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return OrderItemCreateSerializer
        return OrderItemSerializer


class PaymentViewSet(viewsets.ModelViewSet):
    queryset = Payment.objects.all()
    serializer_class = PaymentSerializer
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['date', 'amount', 'order']

    @action(detail=False, methods=['get'])
    def today(self, request):
        today = datetime.date.today()
        todays_payments = Payment.objects.filter(date=today)
        serializer = self.get_serializer(todays_payments, many=True)
        return Response(serializer.data)
    


class DashboardViewSet(viewsets.ViewSet):

    def list(self, request):
        return Response({
            "daily_sales": request.build_absolute_uri('daily_sales/'),
            "daily_payments": request.build_absolute_uri('daily_payments/'),
            "top_debtors": request.build_absolute_uri('top_debtors/')
        })

   

    @action(detail=False, methods=['get'])
    def daily_sales(self, request):
        today = datetime.date.today()
        orders = Order.objects.filter(date=today)
        total = sum(order.total_amount() for order in orders)
        return Response({
            "date": today,
            "total_sales": total,
            "total_orders": orders.count()
        })

    @action(detail=False, methods=['get'])
    def top_debtors(self, request):
        customers = Customer.objects.all()
        data = []
        for c in customers:
            total = sum(o.total_amount() for o in c.orders.all())
            paid = sum(o.paid_amount() for o in c.orders.all())
            if total - paid > 0:
                data.append({
                    "customer": f"{c.first_name} {c.last_name}",
                    "debt": total - paid
                })
        data.sort(key=lambda x: x["debt"], reverse=True)
        return Response(data[:5])

    @action(detail=False, methods=['get'])
    def daily_payments(self, request):
        today = datetime.date.today()
        payments = Payment.objects.filter(date=today)
        total = sum(p.amount for p in payments)
        return Response({
            "date": today,
            "total_payments": total,
            "count": payments.count()
        })




    


    
