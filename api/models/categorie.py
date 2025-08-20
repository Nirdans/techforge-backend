from django.db import models
from .user import User
from .groupe_familial import GroupeFamilial


class Categorie(models.Model):
    id = models.AutoField(primary_key=True)
    nom = models.CharField(max_length=255)
    type = models.CharField(max_length=50)  # ex: 'revenus', 'depenses'
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    groupe_familial = models.ForeignKey(GroupeFamilial, on_delete=models.CASCADE, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.nom} ({self.type})"
