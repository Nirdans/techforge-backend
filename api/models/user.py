from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    # Les champs username, email, password, date_joined, etc. sont déjà inclus dans AbstractUser
    devise = models.CharField(max_length=128)
    solde = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    # created_at et updated_at sont remplacés par date_joined et last_login dans AbstractUser

    def __str__(self):
        return self.username
