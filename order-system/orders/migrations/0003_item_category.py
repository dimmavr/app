# Generated by Django 5.2.4 on 2025-07-12 07:09

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('orders', '0002_order_total'),
    ]

    operations = [
        migrations.AddField(
            model_name='item',
            name='category',
            field=models.CharField(blank=True, max_length=100, null=True),
        ),
    ]
