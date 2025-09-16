from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.db.models import Sum, Count, Q, Min, Max
from django.utils import timezone

from api.models import Transaction, Category
from api.permissions.permissions import IsOwnerOrAdmin, IsGroupMemberOrAdmin
from api.serializers.transaction import (
    TransactionSerializer, TransactionCreateSerializer, 
    TransactionListSerializer, TransactionStatsSerializer
)


class TransactionViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des transactions"""
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['type', 'group', 'category']
    search_fields = ['description', 'category__name', 'group__name']
    ordering_fields = ['date', 'amount', 'created_at']
    ordering = ['-date']
    
    def get_serializer_class(self):
        """Sélectionner le bon serializer selon l'action"""
        if self.action == 'create':
            return TransactionCreateSerializer
        elif self.action == 'list':
            return TransactionListSerializer
        return TransactionSerializer
    
    def get_queryset(self):
        """Retourne les transactions selon les permissions"""
        if self.request.user.is_superuser:
            return Transaction.objects.all().select_related('user', 'category', 'group')
        else:
            # Utilisateur normal : ses transactions + celles des groupes dont il est membre
            user_transactions = Q(user=self.request.user)
            group_transactions = Q(group__members__user=self.request.user)
            
            return Transaction.objects.filter(
                user_transactions | group_transactions
            ).select_related('user', 'category', 'group').distinct()
    
    def perform_create(self, serializer):
        """Créer une transaction"""
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Statistiques des transactions de l'utilisateur"""
        queryset = self.get_queryset().filter(user=request.user)
        
        # Paramètres de date optionnels
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            queryset = queryset.filter(date__gte=start_date)
        if end_date:
            queryset = queryset.filter(date__lte=end_date)
        
        # Calculs statistiques
        income_total = queryset.filter(type='income').aggregate(
            total=Sum('amount'))['total'] or 0
        expense_total = queryset.filter(type='expense').aggregate(
            total=Sum('amount'))['total'] or 0
        
        stats = {
            'total_income': income_total,
            'total_expenses': expense_total,
            'balance': income_total - expense_total,
            'transaction_count': queryset.count(),
            'income_count': queryset.filter(type='income').count(),
            'expense_count': queryset.filter(type='expense').count(),
            'average_transaction': (income_total + expense_total) / max(queryset.count(), 1),
            'period_start': start_date or queryset.aggregate(min_date=Min('date'))['min_date'],
            'period_end': end_date or queryset.aggregate(max_date=Max('date'))['max_date'],
        }
        
        serializer = TransactionStatsSerializer(stats)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Transactions groupées par catégorie"""
        queryset = self.get_queryset().filter(user=request.user)
        
        # Grouper par catégorie
        category_stats = queryset.values(
            'category__name', 'category__type'
        ).annotate(
            total_amount=Sum('amount'),
            transaction_count=Count('id')
        ).order_by('-total_amount')
        
        # Calculer les pourcentages
        total_amount = sum(item['total_amount'] for item in category_stats)
        
        for item in category_stats:
            item['percentage'] = round(
                (item['total_amount'] / total_amount * 100) if total_amount > 0 else 0, 2
            )
        
        return Response(category_stats)
    
    @action(detail=False, methods=['get'])
    def recent(self, request):
        """Transactions récentes (7 derniers jours)"""
        days = int(request.query_params.get('days', 7))
        recent_date = timezone.now() - timezone.timedelta(days=days)
        
        recent_transactions = self.get_queryset().filter(
            user=request.user,
            date__gte=recent_date
        )
        
        serializer = TransactionListSerializer(recent_transactions, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def monthly_summary(self, request):
        """Résumé mensuel des transactions"""
        year = int(request.query_params.get('year', timezone.now().year))
        month = int(request.query_params.get('month', timezone.now().month))
        
        monthly_transactions = self.get_queryset().filter(
            user=request.user,
            date__year=year,
            date__month=month
        )
        
        income_total = monthly_transactions.filter(type='income').aggregate(
            total=Sum('amount'))['total'] or 0
        expense_total = monthly_transactions.filter(type='expense').aggregate(
            total=Sum('amount'))['total'] or 0
        
        summary = {
            'year': year,
            'month': month,
            'total_income': income_total,
            'total_expenses': expense_total,
            'balance': income_total - expense_total,
            'transaction_count': monthly_transactions.count(),
            'transactions': TransactionListSerializer(monthly_transactions, many=True).data
        }
        
        return Response(summary)

    @action(detail=False, methods=['get'])
    def personal(self, request):
        """Retourne seulement les transactions personnelles (pas de groupe)"""
        queryset = self.get_queryset().filter(group__isnull=True)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = TransactionListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = TransactionListSerializer(queryset, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'])
    def groups(self, request):
        """Retourne seulement les transactions de groupe"""
        queryset = self.get_queryset().filter(group__isnull=False)
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = TransactionListSerializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        
        serializer = TransactionListSerializer(queryset, many=True)
        return Response(serializer.data)
