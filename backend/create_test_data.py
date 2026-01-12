#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apartments.models import Apartment, Tenant, RentPayment
from datetime import date

User = get_user_model()
owner1 = User.objects.get(username='owner1')

# Create a second apartment for owner1
apt2 = Apartment.objects.create(
    owner=owner1,
    title='Διαμέρισμα Παπησίων 2',
    address='Οδός Παπησίων 45, Αθήνα',
    square_meters=65,
    floor=2,
    year_built=2010,
    status='rented',
    property_type='apartment'
)
print(f'✓ Created apartment: {apt2.title} (ID: {apt2.id})')

# Create the tenant from the form
tenant = Tenant.objects.create(
    apartment=apt2,
    full_name='Χαρα Λασκαρη',
    phone='6976606744',
    email='haralsk13@gmail.com',
    contract_start=date(2025, 6, 1),
    contract_end=date(2026, 5, 31),
    monthly_rent=450.00,
    payment_due_day=10,  # Due on 10th of each month
    deposit=900.00
)
print(f'✓ Created tenant: {tenant.full_name} (ID: {tenant.id})')

# Create some payments for this tenant
for month in range(7, 13):  # July to December 2025
    payment = RentPayment.objects.create(
        tenant=tenant,
        month=month,
        year=2025,
        amount=450.00,
        due_date=date(2025, month, 10),
        paid=True if month < 12 else False,  # All paid except December
        paid_date=date(2025, month, 10) if month < 12 else None,
        payment_method='bank_transfer' if month < 12 else None,
        notes=f'Payment for {month}/2025'
    )
    status = "✓ Paid" if payment.paid else "⏳ Unpaid"
    print(f'  {status}: {month}/2025 - {payment.amount}€')

# Create payments for January 2026
for month in range(1, 2):
    payment = RentPayment.objects.create(
        tenant=tenant,
        month=month,
        year=2026,
        amount=450.00,
        due_date=date(2026, month, 10),
        paid=False,
        payment_method=None,
        notes=f'Payment for {month}/2026'
    )
    print(f'  ⏳ Unpaid: {month}/2026 - {payment.amount}€')

print(f'\n✅ All test data created successfully!')
print(f'Tenant ID: {tenant.id}')
print(f'Apartment ID: {apt2.id}')
