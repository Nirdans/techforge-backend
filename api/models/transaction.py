from django.db import models
from .user import User
from .groupe_familial import GroupeFamilial
from .categorie import Categorie


class Transaction(models.Model):
    id = models.AutoField(primary_key=True)
    montant = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    description = models.TextField()
    type = models.CharField(max_length=50)  # ex: 'credit', 'debit'
    categorie = models.ForeignKey(Categorie, on_delete=models.CASCADE)
    justificatif = models.FileField(upload_to='justificatifs/', null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    groupe_familial = models.ForeignKey(GroupeFamilial, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.description} - {self.montant} ({self.type})"
