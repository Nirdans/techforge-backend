from rest_framework import serializers
from api.models import Member, User, Group


class MemberSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    user_email = serializers.CharField(source='user.email', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)
    total_contributions = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = Member
        fields = [
            'id', 'user', 'group', 'user_name', 'user_email', 'group_name',
            'description', 'role', 'amount_perso', 'date_join', 'total_contributions'
        ]
        read_only_fields = ['id', 'date_join']
    
    def get_user_name(self, obj):
        """Retourne le nom complet de l'utilisateur"""
        return f"{obj.user.first_name} {obj.user.last_name}"


class MemberCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer un membre"""
    user_email = serializers.EmailField(write_only=True)
    
    class Meta:
        model = Member
        fields = ['group', 'user_email', 'description', 'role']
    
    def validate(self, data):
        """Validation personnalisée"""
        try:
            user = User.objects.get(email=data['user_email'])
            data['user'] = user
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this email does not exist")
        
        # Vérifier que l'utilisateur n'est pas déjà membre
        if Member.objects.filter(user=user, group=data['group']).exists():
            raise serializers.ValidationError("User is already a member of this group")
        
        return data
    
    def create(self, validated_data):
        """Créer un nouveau membre"""
        validated_data.pop('user_email')  # Remove email, we have user now
        return Member.objects.create_member(**validated_data)


class MemberContributionSerializer(serializers.ModelSerializer):
    """Serializer pour afficher les contributions des membres"""
    user_name = serializers.SerializerMethodField()
    user_email = serializers.CharField(source='user.email', read_only=True)
    total_contributions = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    contribution_percentage = serializers.SerializerMethodField()
    
    class Meta:
        model = Member
        fields = [
            'id', 'user_name', 'user_email', 'role', 'amount_perso',
            'total_contributions', 'contribution_percentage', 'date_join'
        ]
    
    def get_user_name(self, obj):
        """Retourne le nom complet de l'utilisateur"""
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def get_contribution_percentage(self, obj):
        """Calcule le pourcentage de contribution du membre"""
        total_contributions = getattr(obj, 'total_contributions', 0) or 0
        group_total = obj.group.calculate_total_balance()
        
        if group_total > 0:
            return round((float(total_contributions) / float(group_total)) * 100, 2)
        return 0.0


class MemberUpdateSerializer(serializers.ModelSerializer):
    """Serializer pour mettre à jour un membre"""
    
    class Meta:
        model = Member
        fields = ['description', 'role', 'amount_perso']
    
    def validate_role(self, value):
        """Validation du rôle"""
        if self.instance and self.instance.role == 'admin':
            # Vérifier qu'il reste au moins un admin dans le groupe
            admin_count = Member.objects.filter(
                group=self.instance.group, 
                role='admin'
            ).count()
            
            if admin_count <= 1 and value != 'admin':
                raise serializers.ValidationError(
                    "Cannot change role: this member is the last admin of the group"
                )
        
        return value
