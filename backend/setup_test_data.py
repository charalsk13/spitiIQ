#!/usr/bin/env python
import os
import django
from datetime import date
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model
from apartments.models import Apartment, Tenant, RentPayment

User = get_user_model()

# Create test owner
owner, created = User.objects.get_or_create(
    username='owner1',
    defaults={
        'email': 'owner@test.gr',
        'role': 'owner',
        'first_name': 'Νίκος',
    }
)
if created:
    owner.set_password('testpass123')
    owner.save()
    print(f"✓ Created owner: {owner.username}")
else:
    print(f"✓ Owner exists: {owner.username}")

# Create test apartment
apt, created = Apartment.objects.get_or_create(
    owner=owner,
    title='Διαμέρισμα Πατησίων',
    defaults={
        'address': 'Οδός Πατησίων 42, Αθήνα',
        'square_meters': 80,
        'status': 'rented',
        'city': 'Αθήνα',
    }
)
print(f"✓ Apartment: {apt.title}")

# Create test tenant
tenant, created = Tenant.objects.get_or_create(
    apartment=apt,
    full_name='Γιάννης Μαρκάκης',
    defaults={
        'phone': '6912345678',
        'contract_start': date(2025, 1, 1),
        'monthly_rent': Decimal('500.00'),
        'deposit': Decimal('1000.00'),
    }
)
print(f"✓ Tenant: {tenant.full_name}")

# Create payments for the last 3 months
payments_data = [
    (1, 2026, False),  # January 2026 - NOT PAID (current month)
    (12, 2025, True),  # December 2025 - PAID
    (11, 2025, True),  # November 2025 - PAID
]

for month, year, is_paid in payments_data:
    due_date = date(year, month, 5)
    payment, created = RentPayment.objects.get_or_create(
        tenant=tenant,
        month=month,
        year=year,
        defaults={
            'amount': Decimal('500.00'),
            'due_date': due_date,
            'paid': is_paid,
            'paid_date': date(year, month, 10) if is_paid else None,
        }
    )
    status = "✓ PAID" if is_paid else "✗ UNPAID"
    print(f"✓ Payment {month}/{year}: {status}")

print("\n" + "="*50)
print("LOGIN CREDENTIALS:")
print("="*50)
print(f"Username: owner1")
print(f"Password: testpass123")
print("="*50)
print(f"\nGo to: http://localhost:5174/login")
print(f"Then navigate to: http://localhost:5174/payments")
