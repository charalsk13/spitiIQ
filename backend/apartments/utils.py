"""
Utility functions for managing apartments and tenants
"""
from datetime import date, timedelta
from dateutil.relativedelta import relativedelta
from django.utils import timezone
from .models import Tenant, RentPayment, Notification


def generate_rent_payments(tenant):
    """
    Auto-generate monthly rent payments for a tenant's contract period.
    Creates payments from contract_start to contract_end (or 12 months ahead if no end date).
    Skips months that already have payment records.
    """
    if not tenant.contract_start:
        return
    
    # Determine end date - use contract_end or 12 months from start
    if tenant.contract_end:
        end_date = tenant.contract_end
    else:
        end_date = tenant.contract_start + relativedelta(months=12)
    
    # Start from contract start date
    current_date = tenant.contract_start
    
    # Generate payments for each month
    while current_date <= end_date:
        month = current_date.month
        year = current_date.year
        
        # Check if payment already exists for this month/year
        if not RentPayment.objects.filter(tenant=tenant, month=month, year=year).exists():
            # Due date is the 5th of each month (or first day if contract starts mid-month)
            if current_date == tenant.contract_start:
                due_date = current_date
            else:
                due_date = date(year, month, 5)
            
            RentPayment.objects.create(
                tenant=tenant,
                month=month,
                year=year,
                amount=tenant.monthly_rent,
                due_date=due_date,
                paid=False
            )
        
        # Move to next month
        current_date = current_date + relativedelta(months=1)


def create_contract_notifications():
    """
    Create notifications for:
    - Contract starting today
    - Contract ending in 7 days
    """
    today = timezone.now().date()
    in_7_days = today + timedelta(days=7)
    
    # Contract starting today
    starting_today = Tenant.objects.filter(contract_start=today)
    for tenant in starting_today:
        Notification.objects.get_or_create(
            user=tenant.apartment.owner,
            notification_type='contract_starting',
            defaults={
                'title': f'Contract Starting - {tenant.full_name}',
                'message': f'Contract for {tenant.full_name} at {tenant.apartment.title} starts today'
            }
        )
    
    # Contract ending in 7 days
    ending_in_7_days = Tenant.objects.filter(contract_end=in_7_days)
    for tenant in ending_in_7_days:
        Notification.objects.get_or_create(
            user=tenant.apartment.owner,
            notification_type='contract_ending',
            defaults={
                'title': f'Contract Ending Soon - {tenant.full_name}',
                'message': f'Contract for {tenant.full_name} at {tenant.apartment.title} ends in 7 days'
            }
        )


def create_overdue_payment_notifications():
    """
    Create notifications for overdue payments
    """
    today = timezone.now().date()
    
    overdue_payments = RentPayment.objects.filter(paid=False, due_date__lt=today)
    for payment in overdue_payments:
        # Check if notification already exists
        if not Notification.objects.filter(
            user=payment.tenant.apartment.owner,
            notification_type='overdue_payment'
        ).exists():
            Notification.objects.create(
                user=payment.tenant.apartment.owner,
                notification_type='overdue_payment',
                title=f'Overdue Payment - {payment.tenant.full_name}',
                message=f'Payment for {payment.tenant.full_name} ({payment.year}/{payment.month}) is overdue'
            )

