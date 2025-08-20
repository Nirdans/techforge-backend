from django.db import models
from .user import User
from .groupe_familial import GroupeFamilial


class MembreGroupe(models.Model):
    id = models.AutoField(primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    groupe = models.ForeignKey(GroupeFamilial, on_delete=models.CASCADE)
    role = models.CharField(max_length=50)  # ex: 'admin', 'membre'
    solde_individuel = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    date_join = models.DateField(auto_now_add=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ('user', 'groupe')

    def __str__(self):
        return f"{self.user.username} - {self.groupe.nom} ({self.role})"
