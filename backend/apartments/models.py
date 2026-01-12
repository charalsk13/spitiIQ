from django.conf import settings
from django.db import models
from django.utils import timezone

User = settings.AUTH_USER_MODEL


class Apartment(models.Model):
    STATUS_CHOICES = (
        ("vacant", "Vacant"),
        ("rented", "Rented"),
        ("maintenance", "Maintenance"),
    )

    PROPERTY_TYPES = (
        ("apartment", "Apartment"),
        ("house", "House"),
        ("detached", "Detached"),
        ("office", "Office"),
        ("land", "Land/Plot"),
    )

    owner = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=150)
    address = models.CharField(max_length=255)
    square_meters = models.IntegerField()
    property_type = models.CharField(max_length=30, choices=PROPERTY_TYPES, default="apartment")
    is_rented = models.BooleanField(default=False)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="vacant")
    floor = models.IntegerField(null=True, blank=True)
    year_built = models.IntegerField(null=True, blank=True)
    notes = models.TextField(blank=True)
    area = models.CharField(max_length=120, blank=True)
    city = models.CharField(max_length=120, blank=True)
    region = models.CharField(max_length=120, blank=True)
    lat = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    lng = models.DecimalField(max_digits=9, decimal_places=6, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # keep is_rented in sync with status for compatibility
        self.is_rented = self.status == "rented"
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Tenant(models.Model):
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE, related_name="tenants")
    full_name = models.CharField(max_length=150)
    phone = models.CharField(max_length=20, blank=True)
    email = models.EmailField(blank=True)
    contract_start = models.DateField()
    contract_end = models.DateField(null=True, blank=True)
    monthly_rent = models.DecimalField(max_digits=10, decimal_places=2)
    payment_due_day = models.IntegerField(default=5, help_text="Η μέρα του μήνα που καταβάλλεται το ενοίκιο (1-31)")
    deposit = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.full_name} - {self.apartment.title}"


class RentPayment(models.Model):
    PAYMENT_METHODS = (
        ("cash", "Μετρητά"),
        ("bank_transfer", "Τραπεζική Μεταφορά"),
        ("check", "Επιταγή"),
        ("card", "Κάρτα"),
        ("other", "Άλλο"),
    )

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="payments")
    month = models.IntegerField()
    year = models.IntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    due_date = models.DateField()
    paid = models.BooleanField(default=False)
    paid_date = models.DateField(null=True, blank=True)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS, null=True, blank=True)
    receipt_number = models.CharField(max_length=100, blank=True, help_text="Αριθμός απόδειξης ή αναφοράς μεταφοράς")
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-year', '-month']
        unique_together = ['tenant', 'month', 'year']

    def __str__(self):
        return f"{self.tenant.full_name} - {self.year}/{self.month} - {'Paid' if self.paid else 'Unpaid'}"

    @property
    def is_overdue(self):
        if self.paid:
            return False
        return timezone.now().date() > self.due_date


class Document(models.Model):
    DOC_TYPES = (
        ("contract", "Contract"),
        ("receipt", "Receipt"),
        ("insurance", "Insurance"),
        ("other", "Other"),
    )

    tenant = models.ForeignKey(Tenant, on_delete=models.CASCADE, related_name="documents", null=True, blank=True)
    apartment = models.ForeignKey(Apartment, on_delete=models.CASCADE, related_name="documents", null=True, blank=True)
    document_type = models.CharField(max_length=20, choices=DOC_TYPES, default="other")
    title = models.CharField(max_length=200)
    file = models.FileField(upload_to="documents/%Y/%m/")
    description = models.TextField(blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-uploaded_at']

    def __str__(self):
        return f"{self.title} - {self.get_document_type_display()}"


class Notification(models.Model):
    NOTIFICATION_TYPES = (
        ("overdue_payment", "Overdue Payment"),
        ("contract_ending", "Contract Ending"),
        ("contract_starting", "Contract Starting"),
        ("payment_due", "Payment Due"),
        ("payment_received", "Payment Received"),
        ("other", "Other"),
    )

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name="notifications")
    notification_type = models.CharField(max_length=30, choices=NOTIFICATION_TYPES)
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.user.username} - {self.title}"