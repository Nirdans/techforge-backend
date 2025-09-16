from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from django.db import models
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi

from api.models import Group, Member
from api.permissions.permissions import IsGroupMemberOrAdmin, IsGroupAdminOrAdmin
from api.serializers.group import (
    GroupSerializer, AddMemberSerializer, RemoveMemberSerializer, PromoteMemberSerializer
)


class GroupViewSet(viewsets.ModelViewSet):
    """ViewSet pour la gestion des groupes financiers"""
    serializer_class = GroupSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'created_at', 'amount']
    ordering = ['-created_at']

    def get_queryset(self):
        """Retourne les groupes selon les permissions de l'utilisateur"""
        if self.request.user.is_superuser:
            return Group.objects.with_member_counts()
        else:
            # Utilisateur normal : seulement ses groupes
            return Group.objects.with_member_counts().filter(members__user=self.request.user)

    @swagger_auto_schema(
        operation_description="Liste tous les groupes où l'utilisateur est membre",
        responses={200: GroupSerializer(many=True)}
    )
    @action(detail=False, methods=['get'])
    def my_groups(self, request):
        """Liste tous les groupes où l'utilisateur est membre (peu importe le statut)"""
        user_groups = Group.objects.with_member_counts().filter(members__user=request.user)
        
        # Ajouter les informations sur le rôle de l'utilisateur dans chaque groupe
        groups_data = []
        for group in user_groups:
            member = Member.objects.get(user=request.user, group=group)
            group_serializer = GroupSerializer(group, context={'request': request})
            group_data = group_serializer.data
            group_data['my_role'] = member.role
            group_data['joined_date'] = member.date_join
            groups_data.append(group_data)
        
        return Response(groups_data)

    def get_permissions(self):
        """Permissions spécifiques selon l'action"""
        if self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsGroupAdminOrAdmin]
        elif self.action in ['retrieve', 'list']:
            permission_classes = [IsGroupMemberOrAdmin]
        else:
            permission_classes = [IsAuthenticated]
        
        return [permission() for permission in permission_classes]

    def perform_create(self, serializer):
        """Créer un groupe et ajouter le créateur comme admin"""
        group = serializer.save()
        # Ajouter le créateur comme admin du groupe
        Member.objects.create_member(
            user=self.request.user,
            group=group,
            role='admin',
            description=f'Creator of {group.name}'
        )

    @action(detail=True, methods=['get'])
    def members(self, request, pk=None):
        """Obtenir les membres d'un groupe"""
        group = self.get_object()
        members = Member.objects.with_contributions().filter(group=group)
        
        from api.serializers.member import MemberSerializer
        serializer = MemberSerializer(members, many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['post'])
    def join(self, request, pk=None):
        """Rejoindre un groupe"""
        group = self.get_object()
        
        try:
            member = Member.objects.create_member(
                user=request.user,
                group=group,
                role='member',
                description=request.data.get('description', '')
            )
            from api.serializers.member import MemberSerializer
            serializer = MemberSerializer(member)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def leave(self, request, pk=None):
        """Quitter un groupe"""
        group = self.get_object()
        
        try:
            member = Member.objects.get(user=request.user, group=group)
            
            # Vérifier qu'il reste au moins un admin
            if member.role == 'admin' and group.admin_count <= 1:
                return Response(
                    {'error': 'Cannot leave: you are the last admin of this group'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            member.delete()
            return Response({'message': 'Successfully left the group'}, status=status.HTTP_200_OK)
        except Member.DoesNotExist:
            return Response(
                {'error': 'You are not a member of this group'}, 
                status=status.HTTP_400_BAD_REQUEST
            )

    @action(detail=True, methods=['get'])
    def financial_summary(self, request, pk=None):
        """Obtenir le résumé financier d'un groupe"""
        group = self.get_object()
        
        # Utiliser le manager pour obtenir les statistiques
        group_with_stats = Group.objects.with_financial_summary().get(pk=group.pk)
        
        summary = {
            'group_name': group.name,
            'total_amount': group.amount,
            'calculated_balance': group.calculate_total_balance(),
            'total_transactions': group_with_stats.total_transactions or 0,
            'total_income': group_with_stats.total_income or 0,
            'total_expenses': group_with_stats.total_expenses or 0,
            'transaction_count': group_with_stats.transaction_count or 0,
            'member_count': group.member_count,
            'admin_count': group.admin_count,
        }
        
        return Response(summary)

    @swagger_auto_schema(
        operation_description="Ajouter un membre au groupe",
        request_body=AddMemberSerializer,
        responses={
            201: "Member added successfully",
            400: "Bad request",
            403: "Permission denied",
            404: "User not found"
        }
    )
    @action(detail=True, methods=['post'])
    def add_member(self, request, pk=None):
        """Ajouter un membre au groupe"""
        group = self.get_object()
        
        # Vérifier que l'utilisateur est admin du groupe
        if not group.is_user_admin(request.user):
            return Response(
                {'error': 'Only group admins can add members'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        user_id = request.data.get('user_id')
        role = request.data.get('role', 'member')
        description = request.data.get('description', '')
        
        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from api.models import User
            user = User.objects.get(id=user_id)
            
            # Vérifier que l'utilisateur n'est pas déjà membre
            if Member.objects.filter(user=user, group=group).exists():
                return Response(
                    {'error': 'User is already a member of this group'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            member = Member.objects.create_member(
                user=user,
                group=group,
                role=role,
                description=description
            )
            
            from api.serializers.member import MemberSerializer
            serializer = MemberSerializer(member)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
            
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=['post'])
    def remove_member(self, request, pk=None):
        """Retirer un membre du groupe"""
        group = self.get_object()
        
        # Vérifier que l'utilisateur est admin du groupe
        if not group.is_user_admin(request.user):
            return Response(
                {'error': 'Only group admins can remove members'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({'error': 'user_id is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from api.models import User
            user = User.objects.get(id=user_id)
            member = Member.objects.get(user=user, group=group)
            
            # Empêcher de supprimer le dernier admin
            if member.role == 'admin' and group.admin_count <= 1:
                return Response(
                    {'error': 'Cannot remove the last admin of the group'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            member.delete()
            return Response({'message': 'Member removed successfully'}, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Member.DoesNotExist:
            return Response({'error': 'User is not a member of this group'}, status=status.HTTP_404_NOT_FOUND)

    @swagger_auto_schema(
        operation_description="Changer le rôle d'un membre (admin, member, viewer)",
        request_body=PromoteMemberSerializer,
        responses={
            200: "Role updated successfully",
            400: "Bad request",
            403: "Permission denied",
            404: "User or member not found"
        }
    )
    @action(detail=True, methods=['post'])
    def promote_member(self, request, pk=None):
        """Promouvoir/changer le rôle d'un membre"""
        group = self.get_object()
        
        # Vérifier que l'utilisateur est admin du groupe
        if not group.is_user_admin(request.user):
            return Response(
                {'error': 'Only group admins can change member roles'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        user_id = request.data.get('user_id')
        new_role = request.data.get('role')
        
        if not user_id or not new_role:
            return Response(
                {'error': 'user_id and role are required'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if new_role not in ['admin', 'member', 'viewer']:
            return Response(
                {'error': 'Invalid role. Must be admin, member, or viewer'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            from api.models import User
            user = User.objects.get(id=user_id)
            member = Member.objects.get(user=user, group=group)
            
            # Empêcher de dégrader le dernier admin
            if member.role == 'admin' and new_role != 'admin' and group.admin_count <= 1:
                return Response(
                    {'error': 'Cannot demote the last admin of the group'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            old_role = member.role
            member.role = new_role
            member.save()
            
            from api.serializers.member import MemberSerializer
            serializer = MemberSerializer(member)
            
            return Response({
                'message': f'Member role updated from {old_role} to {new_role}',
                'member': serializer.data
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Member.DoesNotExist:
            return Response({'error': 'User is not a member of this group'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=True, methods=['get'])
    def transactions(self, request, pk=None):
        """Liste des transactions du groupe"""
        group = self.get_object()
        
        from api.models import Transaction
        transactions = Transaction.objects.filter(group=group).select_related('user', 'category')
        
        from api.serializers.transaction import TransactionSerializer
        serializer = TransactionSerializer(transactions, many=True, context={'request': request})
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def activity(self, request, pk=None):
        """Activité du groupe (transactions récentes + événements)"""
        group = self.get_object()
        
        # Transactions récentes (30 derniers jours)
        from api.models import Transaction
        from django.utils import timezone
        from datetime import timedelta
        
        thirty_days_ago = timezone.now() - timedelta(days=30)
        recent_transactions = Transaction.objects.filter(
            group=group, 
            created_at__gte=thirty_days_ago
        ).select_related('user', 'category').order_by('-created_at')[:20]
        
        # Nouveaux membres récents
        recent_members = Member.objects.filter(
            group=group,
            date_join__gte=thirty_days_ago
        ).select_related('user').order_by('-date_join')[:10]
        
        from api.serializers.transaction import TransactionListSerializer
        from api.serializers.member import MemberSerializer
        
        activity_data = {
            'recent_transactions': TransactionListSerializer(recent_transactions, many=True).data,
            'recent_members': MemberSerializer(recent_members, many=True).data,
            'group_stats': {
                'total_transactions_this_month': recent_transactions.count(),
                'new_members_this_month': recent_members.count(),
                'current_balance': group.calculate_total_balance(),
                'member_count': group.member_count
            }
        }
        
        return Response(activity_data)

    @action(detail=True, methods=['get'])
    def member_activity(self, request, pk=None):
        """Activité d'un membre spécifique dans le groupe"""
        group = self.get_object()
        user_id = request.query_params.get('user_id')
        
        if not user_id:
            return Response({'error': 'user_id parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            from api.models import User, Transaction
            user = User.objects.get(id=user_id)
            member = Member.objects.get(user=user, group=group)
            
            # Transactions de ce membre dans ce groupe
            member_transactions = Transaction.objects.filter(
                user=user, 
                group=group
            ).select_related('category').order_by('-created_at')
            
            from api.serializers.transaction import TransactionListSerializer
            from api.serializers.member import MemberSerializer
            
            activity_data = {
                'member': MemberSerializer(member).data,
                'transactions': TransactionListSerializer(member_transactions, many=True).data,
                'stats': {
                    'total_transactions': member_transactions.count(),
                    'total_contributed': member_transactions.filter(type='income').aggregate(
                        total=models.Sum('amount'))['total'] or 0,
                    'total_expenses': member_transactions.filter(type='expense').aggregate(
                        total=models.Sum('amount'))['total'] or 0,
                }
            }
            
            return Response(activity_data)
            
        except User.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)
        except Member.DoesNotExist:
            return Response({'error': 'User is not a member of this group'}, status=status.HTTP_404_NOT_FOUND)
