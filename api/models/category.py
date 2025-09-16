from django.db import models
from django.utils.translation import gettext_lazy as _
from .user import User
from .group import Group
from api.manager.group_manager import CategoryManager

class Category(models.Model):
    TYPE_CHOICES = [
        ('income', _('Income')),
        ('expense', _('Expense')),
    ]

    name = models.CharField(max_length=200, verbose_name=_("Category Name"))
    type = models.CharField(max_length=20, choices=TYPE_CHOICES, verbose_name=_("Type"))
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories', verbose_name=_("User"))
    group = models.ForeignKey(Group, on_delete=models.CASCADE, related_name='categories', null=True, blank=True, verbose_name=_("Group"))
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    # Manager personnalisé
    objects = CategoryManager()

    class Meta:
        verbose_name = _("Category")
        verbose_name_plural = _("Categories")
        ordering = ['name']

    def __str__(self):
        return f'{self.name} ({self.get_type_display()})'
