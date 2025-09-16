from django.db import models
from django.utils.translation import gettext_lazy as _
from api.manager.group_manager import GroupManager

class Group(models.Model):
    name = models.CharField(max_length=200, verbose_name=_("Group Name"))
    amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, verbose_name=_("Amount"))
    description = models.TextField(blank=True, null=True, verbose_name=_("Description"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Manager personnalisé
    objects = GroupManager()

    class Meta:
        verbose_name = _("Group")
        verbose_name_plural = _("Groups")
        ordering = ['-created_at']

    def __str__(self):
        return f'{self.name} - {self.amount} XOF'
    
    @property
    def member_count(self):
        """Retourne le nombre de membres"""
        return self.members.count()
    
    @property
    def admin_count(self):
        """Retourne le nombre d'admins"""
        return self.members.filter(role='admin').count()
    
    def is_user_member(self, user):
        """Vérifie si un utilisateur est membre du groupe"""
        return self.members.filter(user=user).exists()
    
    def is_user_admin(self, user):
        """Vérifie si un utilisateur est admin du groupe"""
        return self.members.filter(user=user, role='admin').exists()
    
    def calculate_total_balance(self):
        """Calcule le solde total du groupe"""
        income = self.transactions.filter(type='income').aggregate(
            total=models.Sum('amount'))['total'] or 0
        expenses = self.transactions.filter(type='expense').aggregate(
            total=models.Sum('amount'))['total'] or 0
        return income - expenses
