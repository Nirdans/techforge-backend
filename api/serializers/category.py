from rest_framework import serializers
from django.db import models
from api.models import Category, Group


class CategorySerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    group_name = serializers.CharField(source='group.name', read_only=True)
    transaction_count = serializers.IntegerField(read_only=True)
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'type', 'user', 'user_name', 'group', 'group_name',
            'transaction_count', 'total_amount', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user']
    
    def get_user_name(self, obj):
        """Retourne le nom complet de l'utilisateur"""
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def validate_name(self, value):
        """Validation du nom de catégorie"""
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Category name must be at least 2 characters long")
        return value.strip()
    
    def validate(self, data):
        """Validation croisée"""
        group = data.get('group')
        if group:
            request = self.context.get('request')
            if request and not group.is_user_member(request.user):
                raise serializers.ValidationError("You are not a member of this group")
        
        return data
    
    def create(self, validated_data):
        """Créer une catégorie"""
        request = self.context.get('request')
        if request:
            validated_data['user'] = request.user
        return super().create(validated_data)


class CategoryCreateSerializer(serializers.ModelSerializer):
    """Serializer pour créer une catégorie"""
    
    class Meta:
        model = Category
        fields = ['name', 'type', 'group']
    
    def validate_name(self, value):
        if len(value.strip()) < 2:
            raise serializers.ValidationError("Category name must be at least 2 characters long")
        return value.strip()


class CategoryListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour lister les catégories"""
    group_name = serializers.CharField(source='group.name', read_only=True)
    
    class Meta:
        model = Category
        fields = ['id', 'name', 'type', 'group_name']


class CategoryStatsSerializer(serializers.ModelSerializer):
    """Serializer avec statistiques pour les catégories"""
    transaction_count = serializers.IntegerField(read_only=True)
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)
    percentage_of_total = serializers.SerializerMethodField()
    recent_transactions = serializers.SerializerMethodField()
    
    class Meta:
        model = Category
        fields = [
            'id', 'name', 'type', 'transaction_count', 'total_amount',
            'percentage_of_total', 'recent_transactions'
        ]
    
    def get_percentage_of_total(self, obj):
        """Calcule le pourcentage du montant total"""
        total_amount = getattr(obj, 'total_amount', 0) or 0
        
        # Obtenir le total de toutes les catégories du même type
        user = obj.user
        same_type_total = Category.objects.filter(
            user=user, 
            type=obj.type
        ).annotate(
            transaction_count=models.Count('transactions'),
            total_amount=models.Sum('transactions__amount')
        ).aggregate(
            total=models.Sum('total_amount')
        )['total'] or 0
        
        if same_type_total > 0:
            return round((float(total_amount) / float(same_type_total)) * 100, 2)
        return 0.0
    
    def get_recent_transactions(self, obj):
        """Retourne les 3 dernières transactions de cette catégorie"""
        from api.serializers.transaction import TransactionListSerializer
        recent = obj.transactions.all()[:3]
        return TransactionListSerializer(recent, many=True, context=self.context).data
