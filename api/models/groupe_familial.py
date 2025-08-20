from django.db import models


class GroupeFamilial(models.Model):
    id = models.AutoField(primary_key=True)
    nom = models.CharField(max_length=255)
    solde = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nom
