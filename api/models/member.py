from django.db import models
from django.utils.translation import gettext_lazy as _
from .user import User
from .group import Group
from api.manager.group_manager import MemberManager

class Member(models.Model):
    ROLE_CHOICES = [
        ('admin', _('Administrator')),
        ('member', _('Member')),
        ('viewer', _('Viewer')),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='memberships', verbose_name=_("User"))
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='members', verbose_name=_("Group"))
    description = models.TextField(blank=True, null=True, verbose_name=_("Description"))
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='member', verbose_name=_("Role"))
    amount_perso = models.DecimalField(max_digits=12, decimal_places=2, default=0.00, verbose_name=_("Personal Amount"))
    date_join = models.DateTimeField(auto_now_add=True, verbose_name=_("Join Date"))

    # Manager personnalisé
    objects = MemberManager()

    class Meta:
        verbose_name = _("Member")
        verbose_name_plural = _("Members")
        unique_together = ['user', 'group']
        ordering = ['-date_join']

    def __str__(self):
        return f'{self.user.first_name} {self.user.last_name} - {self.group.name} ({self.role})'
    
    @property
    def is_admin(self):
        """Vérifie si le membre est admin"""
        return self.role == 'admin'
    
    @property
    def can_manage_group(self):
        """Vérifie si le membre peut gérer le groupe"""
        return self.role in ['admin']
    
    def calculate_contributions(self):
        """Calcule les contributions totales du membre au groupe"""
        return self.user.transactions.filter(group=self.group).aggregate(
            total=models.Sum('amount'))['total'] or 0
