from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.db.models import Sum, Count, Q

from api.models import Category
from api.permissions.permissions import IsOwnerOrAdmin, IsGroupMemberOrAdmin
from api.serializers.category import (
    CategorySerializer, CategoryCreateSerializer, 
    CategoryListSerializer, CategoryStatsSerializer
)
from api.pagination import SmallResultsSetPagination


class CategoryViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des catégories"""
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name']
    filterset_fields = ['type']
    ordering_fields = ['name', 'created_at']
    ordering = ['name']
    pagination_class = SmallResultsSetPagination  # Pagination spécifique pour les catégories
    
    def get_serializer_class(self):
        """Sélectionner le bon serializer selon l'action"""
        if self.action == 'create':
            return CategoryCreateSerializer
        elif self.action == 'list':
            return CategoryListSerializer
        elif self.action == 'stats':
            return CategoryStatsSerializer
        return CategorySerializer
    
    def get_queryset(self):
        """Retourne les catégories selon les permissions"""
        if self.request.user.is_superuser:
            return Category.objects.all().select_related('user', 'group')
        else:
            # Utilisateur normal : ses catégories + celles des groupes dont il est membre
            user_categories = Q(user=self.request.user)
            group_categories = Q(group__members__user=self.request.user)
            
            return Category.objects.filter(
                user_categories | group_categories
            ).select_related('user', 'group').distinct()
    
    def perform_create(self, serializer):
        """Créer une catégorie"""
        serializer.save(user=self.request.user)
    
    def destroy(self, request, *args, **kwargs):
        """Supprimer une catégorie avec message de confirmation"""
        instance = self.get_object()
        category_name = instance.name
        category_id = instance.id
        
        # Vérifier s'il y a des transactions liées
        transaction_count = instance.transactions.count()
        
        if transaction_count > 0:
            return Response({
                'error': f'Impossible de supprimer la catégorie "{category_name}". Elle contient {transaction_count} transaction(s).',
                'detail': 'Vous devez d\'abord supprimer ou réassigner toutes les transactions de cette catégorie.',
                'category_id': category_id,
                'transaction_count': transaction_count
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Effectuer la suppression
        self.perform_destroy(instance)
        
        return Response({
            'message': f'La catégorie "{category_name}" a été supprimée avec succès.',
            'category_id': category_id,
            'success': True
        }, status=status.HTTP_200_OK)
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Statistiques des catégories avec utilisation"""
        # Utiliser directement Category.objects pour conserver le manager personnalisé
        if self.request.user.is_superuser:
            base_queryset = Category.objects.all()
        else:
            # Utilisateur normal : ses catégories + celles des groupes dont il est membre
            user_categories = Q(user=self.request.user)
            group_categories = Q(group__members__user=self.request.user)
            
            base_queryset = Category.objects.filter(
                user_categories | group_categories
            ).distinct()
        
        # Filtrer par utilisateur et ajouter les statistiques de transaction directement
        categories_with_stats = base_queryset.filter(user=request.user).annotate(
            transaction_count=Count('transactions'),
            total_amount=Sum('transactions__amount')
        ).order_by('-total_amount')
        
        serializer = CategoryStatsSerializer(categories_with_stats, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def most_used(self, request):
        """Catégories les plus utilisées"""
        limit = int(request.query_params.get('limit', 10))
        category_type = request.query_params.get('type')  # 'income' ou 'expense'
        
        # Utiliser directement Category.objects pour conserver le manager personnalisé
        if self.request.user.is_superuser:
            base_queryset = Category.objects.all()
        else:
            # Utilisateur normal : ses catégories + celles des groupes dont il est membre
            user_categories = Q(user=self.request.user)
            group_categories = Q(group__members__user=self.request.user)
            
            base_queryset = Category.objects.filter(
                user_categories | group_categories
            ).distinct()
        
        queryset = base_queryset.filter(user=request.user)
        
        if category_type:
            queryset = queryset.filter(type=category_type)
        
        # Appliquer les annotations et le tri directement
        most_used = queryset.annotate(
            transaction_count=Count('transactions'),
            total_amount=Sum('transactions__amount')
        ).order_by('-transaction_count')[:limit]
        
        serializer = CategoryStatsSerializer(most_used, many=True, context={'request': request})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def by_type(self, request):
        """Catégories groupées par type avec statistiques"""
        # Utiliser directement Category.objects pour conserver le manager personnalisé
        if self.request.user.is_superuser:
            base_queryset = Category.objects.all()
        else:
            # Utilisateur normal : ses catégories + celles des groupes dont il est membre
            user_categories = Q(user=self.request.user)
            group_categories = Q(group__members__user=self.request.user)
            
            base_queryset = Category.objects.filter(
                user_categories | group_categories
            ).distinct()
        
        queryset = base_queryset.filter(user=request.user)
        
        # Séparer les catégories par type et ajouter les annotations
        income_categories = queryset.filter(type='income').annotate(
            transaction_count=Count('transactions'),
            total_amount=Sum('transactions__amount')
        )
        expense_categories = queryset.filter(type='expense').annotate(
            transaction_count=Count('transactions'),
            total_amount=Sum('transactions__amount')
        )
        
        # Calculer les totaux par type
        income_total = income_categories.aggregate(total=Sum('total_amount'))['total'] or 0
        expense_total = expense_categories.aggregate(total=Sum('total_amount'))['total'] or 0
        
        response_data = {
            'income': {
                'total_amount': income_total,
                'category_count': income_categories.count(),
                'categories': CategoryListSerializer(income_categories, many=True).data
            },
            'expense': {
                'total_amount': expense_total,
                'category_count': expense_categories.count(),
                'categories': CategoryListSerializer(expense_categories, many=True).data
            }
        }
        
        return Response(response_data)
    
    @action(detail=True, methods=['get'])
    def transactions(self, request, pk=None):
        """Obtenir toutes les transactions d'une catégorie"""
        category = self.get_object()
        transactions = category.transactions.all()
        
        # Filtres optionnels
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        
        if start_date:
            transactions = transactions.filter(date__gte=start_date)
        if end_date:
            transactions = transactions.filter(date__lte=end_date)
        
        from api.serializers.transaction import TransactionListSerializer
        serializer = TransactionListSerializer(transactions, many=True)
        
        # Ajouter quelques statistiques
        total_amount = transactions.aggregate(total=Sum('amount'))['total'] or 0
        transaction_count = transactions.count()
        
        response_data = {
            'category': CategorySerializer(category).data,
            'total_amount': total_amount,
            'transaction_count': transaction_count,
            'transactions': serializer.data
        }
        
        return Response(response_data)
