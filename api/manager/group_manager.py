from django.db import models
from django.db.models import Sum, Count, Q
from django.utils import timezone


class GroupManager(models.Manager):
    """Manager pour les groupes financiers"""
    
    def create_group(self, name, description="", creator=None):
        """Créer un nouveau groupe avec un créateur comme admin"""
        group = self.create(
            name=name,
            description=description,
            amount=0.00
        )
        
        # Ajouter le créateur comme admin du groupe s'il est fourni
        if creator:
            from api.models import Member  # Import local pour éviter la circularité
            Member.objects.create(
                user=creator,
                group=group,
                role='admin',
                description=f'Creator of {name}',
                amount_perso=0.00
            )
        
        return group
    
    def with_member_counts(self):
        """Retourne les groupes avec le nombre de membres"""
        return self.annotate(
            annotated_member_count=Count('members', distinct=True),
            annotated_active_member_count=Count('members', filter=Q(members__user__is_active=True), distinct=True)
        )
    
    def with_financial_summary(self):
        """Retourne les groupes avec résumé financier"""
        return self.annotate(
            total_transactions=Sum('transactions__amount'),
            total_income=Sum('transactions__amount', filter=Q(transactions__type='income')),
            total_expenses=Sum('transactions__amount', filter=Q(transactions__type='expense')),
            transaction_count=Count('transactions', distinct=True)
        )
    
    def user_groups(self, user):
        """Retourne les groupes dont l'utilisateur est membre"""
        return self.filter(members__user=user)
    
    def user_admin_groups(self, user):
        """Retourne les groupes où l'utilisateur est admin"""
        return self.filter(members__user=user, members__role='admin')
    
    def active_groups(self):
        """Retourne les groupes actifs (avec au moins un membre actif)"""
        return self.filter(members__user__is_active=True).distinct()
    
    def by_activity_level(self, days=30):
        """Retourne les groupes triés par activité récente"""
        recent_date = timezone.now() - timezone.timedelta(days=days)
        return self.annotate(
            recent_activity=Count('transactions', filter=Q(transactions__date__gte=recent_date))
        ).order_by('-recent_activity')


class MemberManager(models.Manager):
    """Manager pour les membres de groupes"""
    
    def create_member(self, user, group, role='member', description=""):
        """Créer un nouveau membre avec validation"""
        # Vérifier si l'utilisateur est déjà membre du groupe
        if self.filter(user=user, group=group).exists():
            raise ValueError(f"User {user.email} is already a member of group {group.name}")
        
        return self.create(
            user=user,
            group=group,
            role=role,
            description=description,
            amount_perso=0.00
        )
    
    def promote_to_admin(self, user, group):
        """Promouvoir un membre au rôle d'admin"""
        member = self.get(user=user, group=group)
        member.role = 'admin'
        member.save()
        return member
    
    def demote_to_member(self, user, group):
        """Rétrograder un admin au rôle de membre"""
        member = self.get(user=user, group=group)
        # Vérifier qu'il reste au moins un admin dans le groupe
        admin_count = self.filter(group=group, role='admin').count()
        if admin_count <= 1 and member.role == 'admin':
            raise ValueError("Cannot demote the last admin of the group")
        
        member.role = 'member'
        member.save()
        return member
    
    def group_admins(self, group):
        """Retourne les admins d'un groupe"""
        return self.filter(group=group, role='admin')
    
    def group_members(self, group):
        """Retourne tous les membres d'un groupe"""
        return self.filter(group=group)
    
    def active_members(self, group):
        """Retourne les membres actifs d'un groupe"""
        return self.filter(group=group, user__is_active=True)
    
    def user_memberships(self, user):
        """Retourne toutes les adhésions d'un utilisateur"""
        return self.filter(user=user)
    
    def with_contributions(self):
        """Retourne les membres avec leurs contributions financières"""
        return self.annotate(
            total_contributions=Sum('user__transactions__amount', 
                                  filter=Q(user__transactions__group=models.F('group')))
        )


class TransactionManager(models.Manager):
    """Manager pour les transactions financières"""
    
    def user_transactions(self, user):
        """Retourne les transactions d'un utilisateur"""
        return self.filter(user=user)
    
    def group_transactions(self, group):
        """Retourne les transactions d'un groupe"""
        return self.filter(group=group)
    
    def income_transactions(self):
        """Retourne seulement les revenus"""
        return self.filter(type='income')
    
    def expense_transactions(self):
        """Retourne seulement les dépenses"""
        return self.filter(type='expense')
    
    def by_date_range(self, start_date, end_date):
        """Retourne les transactions dans une plage de dates"""
        return self.filter(date__gte=start_date, date__lte=end_date)
    
    def recent_transactions(self, days=30):
        """Retourne les transactions récentes"""
        recent_date = timezone.now() - timezone.timedelta(days=days)
        return self.filter(date__gte=recent_date)
    
    def by_category(self, category):
        """Retourne les transactions par catégorie"""
        return self.filter(category=category)
    
    def with_proof(self):
        """Retourne les transactions avec preuve"""
        return self.exclude(preuve__isnull=True).exclude(preuve='')
    
    def calculate_balance(self, user=None, group=None):
        """Calcule le solde (revenus - dépenses)"""
        queryset = self
        
        if user:
            queryset = queryset.filter(user=user)
        if group:
            queryset = queryset.filter(group=group)
        
        income = queryset.filter(type='income').aggregate(
            total=Sum('amount'))['total'] or 0
        expenses = queryset.filter(type='expense').aggregate(
            total=Sum('amount'))['total'] or 0
        
        return income - expenses


class CategoryManager(models.Manager):
    """Manager pour les catégories"""
    
    def user_categories(self, user):
        """Retourne les catégories d'un utilisateur"""
        return self.filter(user=user)
    
    def group_categories(self, group):
        """Retourne les catégories d'un groupe"""
        return self.filter(group=group)
    
    def income_categories(self):
        """Retourne les catégories de revenus"""
        return self.filter(type='income')
    
    def expense_categories(self):
        """Retourne les catégories de dépenses"""
        return self.filter(type='expense')
    
    def with_transaction_counts(self):
        """Retourne les catégories avec le nombre de transactions"""
        return self.annotate(
            transaction_count=Count('transactions'),
            total_amount=Sum('transactions__amount')
        )
    
    def most_used(self, limit=10):
        """Retourne les catégories les plus utilisées"""
        return self.with_transaction_counts().order_by('-transaction_count')[:limit]
