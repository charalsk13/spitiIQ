from rest_framework.viewsets import ModelViewSet
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.db import models
from .models import Apartment, Tenant, RentPayment, Document, Notification
from .serializers import ApartmentSerializer, TenantSerializer, RentPaymentSerializer, DocumentSerializer, NotificationSerializer


def get_allowed_owner_ids(user):
    if user.role == 'admin':
        return None  # all owners allowed
    if user.role == 'owner':
        return [user.id]
    if user.role == 'accountant':
        from users.models import AccountantOwner
        return list(AccountantOwner.objects.filter(accountant=user).values_list('owner_id', flat=True))
    return []


class ApartmentViewSet(ModelViewSet):
    serializer_class = ApartmentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        owner_ids = get_allowed_owner_ids(self.request.user)
        qs = Apartment.objects.all()
        if owner_ids is not None:
            qs = qs.filter(owner_id__in=owner_ids)
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'owner':
            serializer.save(owner=user)
            return
        # admin or accountant must provide owner
        owner_id = self.request.data.get('owner')
        if not owner_id:
            raise PermissionDenied("Απαιτείται owner για δημιουργία")
        try:
            owner_id = int(owner_id)
        except ValueError:
            raise PermissionDenied("Μη έγκυρο owner")
        owner_ids = get_allowed_owner_ids(user)
        if owner_ids is not None and owner_id not in owner_ids:
            raise PermissionDenied("Δεν έχετε πρόσβαση σε αυτόν τον ιδιοκτήτη")
        serializer.save(owner_id=owner_id)


class TenantViewSet(ModelViewSet):
    serializer_class = TenantSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        owner_ids = get_allowed_owner_ids(self.request.user)
        qs = Tenant.objects.select_related('apartment')
        if owner_ids is not None:
            qs = qs.filter(apartment__owner_id__in=owner_ids)
        return qs

    def perform_create(self, serializer):
        tenant = serializer.save()
        # Auto-generate rent payments
        from .utils import generate_rent_payments
        generate_rent_payments(tenant)

    def perform_update(self, serializer):
        tenant = serializer.save()
        # Regenerate rent payments if contract dates changed
        from .utils import generate_rent_payments
        generate_rent_payments(tenant)


class RentPaymentViewSet(ModelViewSet):
    serializer_class = RentPaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        owner_ids = get_allowed_owner_ids(self.request.user)
        qs = RentPayment.objects.select_related('tenant__apartment')
        if owner_ids is not None:
            qs = qs.filter(tenant__apartment__owner_id__in=owner_ids)
        return qs

    @action(detail=True, methods=['post'])
    def mark_paid(self, request, pk=None):
        """Mark a payment as paid"""
        from django.utils import timezone
        payment = self.get_object()
        payment.paid = True
        payment.paid_date = timezone.now().date()
        
        # Update payment with additional info if provided
        if 'payment_method' in request.data:
            payment.payment_method = request.data['payment_method']
        if 'receipt_number' in request.data:
            payment.receipt_number = request.data['receipt_number']
        if 'notes' in request.data:
            payment.notes = request.data['notes']
        
        payment.save()
        
        # Create notification for owner
        owner = payment.tenant.apartment.owner
        Notification.objects.create(
            user=owner,
            notification_type="payment_received",
            title=f"Ενοίκιο Λήφθηκε - {payment.tenant.full_name}",
            message=f"Λήφθηκε ενοίκιο {payment.tenant.full_name} για το {payment.month}/{payment.year} ποσού {payment.amount}€"
        )
        
        serializer = self.get_serializer(payment)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def mark_unpaid(self, request, pk=None):
        """Mark a payment as unpaid"""
        payment = self.get_object()
        payment.paid = False
        payment.paid_date = None
        payment.save()
        serializer = self.get_serializer(payment)
        return Response(serializer.data)


class DocumentViewSet(ModelViewSet):
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        owner_ids = get_allowed_owner_ids(self.request.user)
        qs = Document.objects.all()
        if owner_ids is not None:
            qs = qs.filter(
                models.Q(tenant__apartment__owner_id__in=owner_ids) |
                models.Q(apartment__owner_id__in=owner_ids)
            )
        return qs

    def perform_create(self, serializer):
        serializer.save()


class NotificationViewSet(ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Notification.objects.filter(user=self.request.user)

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        """Mark notification as read"""
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        serializer = self.get_serializer(notification)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def unread_count(self, request):
        """Get count of unread notifications"""
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({'unread_count': count})


class TenantHistoryViewSet(ModelViewSet):
    """ViewSet for retrieving tenant history with contracts and payments"""
    serializer_class = TenantSerializer
    permission_classes = [IsAuthenticated]
    http_method_names = ['get']

    def get_queryset(self):
        owner_ids = get_allowed_owner_ids(self.request.user)
        qs = Tenant.objects.select_related('apartment').prefetch_related('payments')
        if owner_ids is not None:
            qs = qs.filter(apartment__owner_id__in=owner_ids)
        return qs

    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get summary of all tenants, contracts, and payments"""
        tenants = self.get_queryset()
        
        summary_data = {
            'total_tenants': tenants.count(),
            'current_tenants': tenants.filter(contract_end__isnull=True).count(),
            'past_tenants': tenants.filter(contract_end__isnull=False).count(),
            'total_rent_collected': 0,
            'total_payments_received': 0,
            'pending_payments': 0,
            'tenants': []
        }

        for tenant in tenants:
            payments = tenant.payments.all()
            paid_payments = payments.filter(paid=True)
            unpaid_payments = payments.filter(paid=False)
            
            total_paid = sum(p.amount for p in paid_payments)
            total_unpaid = sum(p.amount for p in unpaid_payments)
            
            summary_data['total_rent_collected'] += float(tenant.monthly_rent) if tenant.contract_end is None else 0
            summary_data['total_payments_received'] += float(total_paid)
            summary_data['pending_payments'] += float(total_unpaid)
            
            tenant_data = {
                'id': tenant.id,
                'full_name': tenant.full_name,
                'email': tenant.email,
                'phone': tenant.phone,
                'apartment': tenant.apartment.title,
                'apartment_id': tenant.apartment.id,
                'contract_start': tenant.contract_start,
                'contract_end': tenant.contract_end,
                'monthly_rent': float(tenant.monthly_rent),
                'deposit': float(tenant.deposit),
                'status': 'Current' if tenant.contract_end is None else 'Past',
                'total_paid': float(total_paid),
                'total_unpaid': float(total_unpaid),
                'total_payments': paid_payments.count() + unpaid_payments.count(),
                'paid_count': paid_payments.count(),
                'unpaid_count': unpaid_payments.count(),
            }
            summary_data['tenants'].append(tenant_data)

        return Response(summary_data)