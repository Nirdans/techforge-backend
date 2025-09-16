from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.db.models import Sum, Count, Q
from django.utils import timezone

from api.models import Member, Group
from api.permissions.permissions import IsGroupMemberOrAdmin, IsGroupAdminOrAdmin
from api.serializers.member import (
    MemberSerializer, MemberCreateSerializer, 
    MemberContributionSerializer, MemberUpdateSerializer
)


class MemberViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des membres de groupes"""
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__first_name', 'user__last_name', 'user__email']
    filterset_fields = ['role', 'group']
    ordering_fields = ['date_join', 'role', 'amount_perso']
    ordering = ['-date_join']
    
    def get_serializer_class(self):
        """Sélectionner le bon serializer selon l'action"""
        if self.action == 'create':
            return MemberCreateSerializer
        elif self.action in ['update', 'partial_update']:
            return MemberUpdateSerializer
        elif self.action == 'contributions':
            return MemberContributionSerializer
        return MemberSerializer
    
    def get_queryset(self):
        """Retourne les membres selon les permissions"""
        if self.request.user.is_superuser:
            return Member.objects.all().select_related('user', 'group')
        else:
            # Utilisateur normal : seulement les membres des groupes dont il fait partie
            return Member.objects.filter(
                group__members__user=self.request.user
            ).select_related('user', 'group').distinct()
    
    def get_permissions(self):
        """Permissions spécifiques selon l'action"""
        if self.action in ['create', 'destroy']:
            permission_classes = [IsAuthenticated, IsGroupAdminOrAdmin]
        elif self.action in ['update', 'partial_update']:
            permission_classes = [IsAuthenticated, IsGroupAdminOrAdmin]
        else:
            permission_classes = [IsAuthenticated, IsGroupMemberOrAdmin]
        
        return [permission() for permission in permission_classes]
    
    @action(detail=False, methods=['get'])
    def my_memberships(self, request):
        """Obtenir toutes les adhésions de l'utilisateur connecté"""
        memberships = Member.objects.with_contributions().filter(user=request.user)
        serializer = MemberContributionSerializer(memberships, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def contributions(self, request):
        """Membres avec leurs contributions financières"""
        group_id = request.query_params.get('group_id')
        
        # Commencer par le manager avec annotations
        queryset = Member.objects.with_contributions()
        
        # Filtrer par les groupes de l'utilisateur si ce n'est pas un superuser
        if not request.user.is_superuser:
            user_groups = Group.objects.filter(members__user=request.user)
            queryset = queryset.filter(group__in=user_groups)
        
        # Filtrer par groupe spécifique si demandé
        if group_id:
            try:
                group = Group.objects.get(id=group_id)
                # Vérifier que l'utilisateur a accès à ce groupe
                if not group.is_user_member(request.user) and not request.user.is_superuser:
                    return Response(
                        {'error': 'You do not have access to this group'}, 
                        status=status.HTTP_403_FORBIDDEN
                    )
                queryset = queryset.filter(group=group)
            except Group.DoesNotExist:
                return Response(
                    {'error': 'Group not found'}, 
                    status=status.HTTP_404_NOT_FOUND
                )
        
        members_with_contributions = queryset.order_by('-total_contributions')
        serializer = MemberContributionSerializer(members_with_contributions, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def promote(self, request, pk=None):
        """Promouvoir un membre au rôle d'admin"""
        member = self.get_object()
        
        # Vérifier que l'utilisateur actuel est admin du groupe
        if not member.group.is_user_admin(request.user) and not request.user.is_superuser:
            return Response(
                {'error': 'Only group admins can promote members'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            promoted_member = Member.objects.promote_to_admin(member.user, member.group)
            serializer = MemberSerializer(promoted_member)
            return Response(serializer.data)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def demote(self, request, pk=None):
        """Rétrograder un admin au rôle de membre"""
        member = self.get_object()
        
        # Vérifier que l'utilisateur actuel est admin du groupe
        if not member.group.is_user_admin(request.user) and not request.user.is_superuser:
            return Response(
                {'error': 'Only group admins can demote members'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        try:
            demoted_member = Member.objects.demote_to_member(member.user, member.group)
            serializer = MemberSerializer(demoted_member)
            return Response(serializer.data)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['get'])
    def activity(self, request, pk=None):
        """Obtenir l'activité d'un membre (transactions, etc.)"""
        member = self.get_object()
        
        # Transactions du membre dans ce groupe
        transactions = member.user.transactions.filter(group=member.group)
        
        # Statistiques
        total_transactions = transactions.count()
        total_contributed = transactions.aggregate(total=Sum('amount'))['total'] or 0
        recent_transactions = transactions.order_by('-date')[:5]
        
        from api.serializers.transaction import TransactionListSerializer
        
        activity_data = {
            'member': MemberSerializer(member).data,
            'total_transactions': total_transactions,
            'total_contributed': total_contributed,
            'recent_transactions': TransactionListSerializer(recent_transactions, many=True).data,
            'join_date': member.date_join,
            'days_in_group': (timezone.now().date() - member.date_join.date()).days
        }
        
        return Response(activity_data)
