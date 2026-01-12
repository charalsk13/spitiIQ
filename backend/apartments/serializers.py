# apartments/serializers.py
from rest_framework import serializers
from .models import Apartment, Tenant, RentPayment, Document, Notification


class ApartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Apartment
        fields = '__all__'
        read_only_fields = ['owner']


class TenantSerializer(serializers.ModelSerializer):
    apartment_address = serializers.CharField(source='apartment.address', read_only=True)
    apartment_title = serializers.CharField(source='apartment.title', read_only=True)

    class Meta:
        model = Tenant
        fields = '__all__'


class RentPaymentSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.full_name', read_only=True)
    apartment_title = serializers.CharField(source='tenant.apartment.title', read_only=True)
    apartment_address = serializers.CharField(source='tenant.apartment.address', read_only=True)
    is_overdue = serializers.BooleanField(read_only=True)
    payment_method_display = serializers.CharField(source='get_payment_method_display', read_only=True)

    class Meta:
        model = RentPayment
        fields = '__all__'


class DocumentSerializer(serializers.ModelSerializer):
    tenant_name = serializers.CharField(source='tenant.full_name', read_only=True, allow_null=True)
    apartment_title = serializers.CharField(source='apartment.title', read_only=True, allow_null=True)

    class Meta:
        model = Document
        fields = '__all__'


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        read_only_fields = ['user', 'created_at']
