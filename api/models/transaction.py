from django.db import models
from django.utils.translation import gettext_lazy as _
from .user import User
from .group import Group
from .category import Category
from api.manager.group_manager import TransactionManager

class Transaction(models.Model):
    TYPE_CHOICES = [
        ('income', _('Income')),
        ('expense', _('Expense')),
    ]

    amount = models.DecimalField(max_digits=12, decimal_places=2, verbose_name=_("Amount"))
    date = models.DateTimeField(verbose_name=_("Date"))
    description = models.TextField(verbose_name=_("Description"))
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, verbose_name=_("Type"))
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions', verbose_name=_("Category"))
    preuve = models.FileField(upload_to='transaction_proofs/', null=True, blank=True, verbose_name=_("Proof"))
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions', verbose_name=_("User"))
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='transactions', null=True, blank=True, verbose_name=_("Group"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Manager personnalisé
    objects = TransactionManager()

    class Meta:
        verbose_name = _("Transaction")
        verbose_name_plural = _("Transactions")
        ordering = ['-date']

    def __str__(self):
        return f'{self.amount} XOF - {self.description} ({self.get_type_display()})'
    
    def save(self, *args, **kwargs):
        """Override save pour mettre à jour le solde du groupe ou de l'utilisateur"""
        # Vérifier si c'est une mise à jour d'une transaction existante
        is_update = self.pk is not None
        old_transaction = None
        
        if is_update:
            # Récupérer l'ancienne transaction pour pouvoir annuler son effet
            old_transaction = Transaction.objects.get(pk=self.pk)
        
        # Sauvegarder la transaction
        super().save(*args, **kwargs)
        
        # Mettre à jour le solde approprié (groupe ou utilisateur)
        self._update_balance(old_transaction)
    
    def delete(self, *args, **kwargs):
        """Override delete pour mettre à jour le solde du groupe ou de l'utilisateur"""
        group = self.group
        user = self.user
        amount = self.amount
        transaction_type = self.type
        
        # Supprimer la transaction
        super().delete(*args, **kwargs)
        
        # Mettre à jour le solde en annulant l'effet de cette transaction
        if group:
            # Transaction de groupe - mettre à jour le solde du groupe
            if transaction_type == 'income':
                group.amount -= amount
            else:  # expense
                group.amount += amount
            group.save()
        else:
            # Transaction personnelle - mettre à jour le solde de l'utilisateur
            if transaction_type == 'income':
                user.solde -= amount
            else:  # expense
                user.solde += amount
            user.save()
    
    def _update_balance(self, old_transaction=None):
        """Méthode privée pour mettre à jour le solde du groupe ou de l'utilisateur"""
        
        # Si c'est une mise à jour, annuler l'effet de l'ancienne transaction
        if old_transaction:
            if old_transaction.group:
                # Ancienne transaction était pour un groupe
                group = old_transaction.group
                if old_transaction.type == 'income':
                    group.amount -= old_transaction.amount
                else:  # expense
                    group.amount += old_transaction.amount
                group.save()
            else:
                # Ancienne transaction était personnelle
                user = old_transaction.user
                if old_transaction.type == 'income':
                    user.solde -= old_transaction.amount
                else:  # expense
                    user.solde += old_transaction.amount
                user.save()
        
        # Appliquer l'effet de la nouvelle transaction
        if self.group:
            # Transaction de groupe - mettre à jour le solde du groupe
            group = self.group
            if self.type == 'income':
                group.amount += self.amount
            else:  # expense
                group.amount -= self.amount
            group.save()
        else:
            # Transaction personnelle - mettre à jour le solde de l'utilisateur
            user = self.user
            if self.type == 'income':
                user.solde += self.amount
            else:  # expense
                user.solde -= self.amount
            user.save()
