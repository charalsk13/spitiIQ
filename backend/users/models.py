
from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    ROLE_CHOICES = (
        ("owner", "Owner"),
        ("admin", "Admin"),
        ("accountant", "Accountant"),
    )

    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default="owner")


class AccountantOwner(models.Model):
    accountant = models.ForeignKey(User, on_delete=models.CASCADE, related_name="managed_owners")
    owner = models.ForeignKey(User, on_delete=models.CASCADE, related_name="accountants")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("accountant", "owner")

    def __str__(self):
        return f"{self.accountant.username} -> {self.owner.username}"
