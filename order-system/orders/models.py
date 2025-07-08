from django.db import models


# Create your models here.
class Customer(models.Model):
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    tax_id = models.CharField(max_length=15)
    phone = models.CharField(max_length=20)
    email = models.EmailField(blank=True, null=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Item(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return self.name


class Order(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='orders')
    date = models.DateField(auto_now_add=True)
    total = models.DecimalField(max_digits=10, decimal_places=2, default=0)

    def total_amount(self):
        return sum([item.total_price() for item in self.items.all()])

    def paid_amount(self):
        return sum([payment.amount for payment in self.payments.all()])

    def remaining_amount(self):
        return self.total_amount() - self.paid_amount()

    def is_paid(self):
        return self.remaining_amount() <= 0

    def __str__(self):
        return f"Παραγγελία #{self.id} για {self.customer}"



class OrderItem(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items')
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField(default=1)

    def total_price(self):
        return self.item.price * self.quantity

    def __str__(self):
        return f"{self.quantity} x {self.item.name}"


class Payment(models.Model):
    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='payments')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField(auto_now_add=True)
    notes = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"Πληρωμή {self.amount} για Παραγγελία {self.order.id}"
