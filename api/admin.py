from django.contrib import admin
from .models import User, GroupeFamilial, Categorie, MembreGroupe, Transaction

# Register your models here.

@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ('user_id', 'username', 'email', 'devise', 'solde', 'created_at')
    list_filter = ('devise', 'created_at')
    search_fields = ('username', 'email')
    readonly_fields = ('user_id', 'created_at', 'updated_at')


@admin.register(GroupeFamilial)
class GroupeFamilialAdmin(admin.ModelAdmin):
    list_display = ('id', 'nom', 'solde', 'created_at')
    search_fields = ('nom',)
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(Categorie)
class CategorieAdmin(admin.ModelAdmin):
    list_display = ('id', 'nom', 'type', 'user', 'groupe_familial', 'created_at')
    list_filter = ('type', 'created_at')
    search_fields = ('nom', 'user__username')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(MembreGroupe)
class MembreGroupeAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'groupe', 'role', 'solde_individuel', 'date_join')
    list_filter = ('role', 'date_join')
    search_fields = ('user__username', 'groupe__nom')
    readonly_fields = ('id', 'created_at', 'updated_at')


@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('id', 'description', 'montant', 'type', 'date', 'user', 'categorie')
    list_filter = ('type', 'date', 'categorie__type')
    search_fields = ('description', 'user__username', 'categorie__nom')
    readonly_fields = ('id', 'created_at', 'updated_at')
    date_hierarchy = 'date'
