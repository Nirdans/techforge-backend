from django.db import models

# Create your models here.

class User(models.Model):
    user_id = models.AutoField(primary_key=True)
    username = models.CharField(max_length=150, unique=True)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=128)
    devise = models.CharField(max_length=128)
    solde = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.username


class GroupeFamilial(models.Model):
    id = models.AutoField(primary_key=True)
    nom = models.CharField(max_length=255)
    solde = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.nom


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
    