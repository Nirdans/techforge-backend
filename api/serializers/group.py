from rest_framework import serializers
from api.models import Group, Member


class GroupSerializer(serializers.ModelSerializer):
    member_count = serializers.IntegerField(read_only=True)
    admin_count = serializers.IntegerField(read_only=True)
    is_member = serializers.SerializerMethodField()
    is_admin = serializers.SerializerMethodField()
    calculated_balance = serializers.SerializerMethodField()
    
    class Meta:
        model = Group
        fields = [
            'id', 'name', 'amount', 'description', 'created_at', 'updated_at',
            'member_count', 'admin_count', 'is_member', 'is_admin', 'calculated_balance'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'amount']
    
    def get_is_member(self, obj):
        """Vérifie si l'utilisateur actuel est membre du groupe"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.is_user_member(request.user)
        return False
    
    def get_is_admin(self, obj):
        """Vérifie si l'utilisateur actuel est admin du groupe"""
        request = self.context.get('request')
        if request and request.user.is_authenticated:
            return obj.is_user_admin(request.user)
        return False
    
    def get_calculated_balance(self, obj):
        """Retourne le solde calculé du groupe"""
        return obj.calculate_total_balance()


class GroupCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création de groupes"""
    
    class Meta:
        model = Group
        fields = ['name', 'description']
    
    def validate_name(self, value):
        """Validation du nom du groupe"""
        if len(value.strip()) < 3:
            raise serializers.ValidationError("Group name must be at least 3 characters long")
        return value.strip()


class GroupDetailSerializer(GroupSerializer):
    """Serializer détaillé pour un groupe avec informations supplémentaires"""
    recent_transactions = serializers.SerializerMethodField()
    top_contributors = serializers.SerializerMethodField()
    
    class Meta(GroupSerializer.Meta):
        fields = GroupSerializer.Meta.fields + ['recent_transactions', 'top_contributors']
    
    def get_recent_transactions(self, obj):
        """Retourne les 5 dernières transactions du groupe"""
        from api.serializers.transaction import TransactionListSerializer
        recent = obj.transactions.all()[:5]
        return TransactionListSerializer(recent, many=True, context=self.context).data
    
    def get_top_contributors(self, obj):
        """Retourne les top contributeurs du groupe"""
        from api.serializers.member import MemberContributionSerializer
        from api.models import Member
        members = Member.objects.with_contributions().filter(group=obj).order_by('-total_contributions')[:5]
        return MemberContributionSerializer(members, many=True, context=self.context).data


class AddMemberSerializer(serializers.Serializer):
    """Serializer pour ajouter un membre à un groupe"""
    user_id = serializers.IntegerField()
    role = serializers.ChoiceField(choices=['admin', 'member', 'viewer'], default='member')
    description = serializers.CharField(max_length=500, required=False, allow_blank=True)
    
    def validate_user_id(self, value):
        """Valider que l'utilisateur existe"""
        from api.models import User
        try:
            User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")
        return value


class RemoveMemberSerializer(serializers.Serializer):
    """Serializer pour retirer un membre d'un groupe"""
    user_id = serializers.IntegerField()
    
    def validate_user_id(self, value):
        """Valider que l'utilisateur existe"""
        from api.models import User
        try:
            User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")
        return value


class PromoteMemberSerializer(serializers.Serializer):
    """Serializer pour changer le rôle d'un membre"""
    user_id = serializers.IntegerField()
    role = serializers.ChoiceField(choices=['admin', 'member', 'viewer'])
    
    def validate_user_id(self, value):
        """Valider que l'utilisateur existe"""
        from api.models import User
        try:
            User.objects.get(id=value)
        except User.DoesNotExist:
            raise serializers.ValidationError("User not found")
        return value
