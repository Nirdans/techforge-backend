from rest_framework import serializers
from api.models import Transaction, Category, Group
from django.utils import timezone


class TransactionSerializer(serializers.ModelSerializer):
    user_name = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)
    is_group_transaction = serializers.SerializerMethodField()
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'amount', 'date', 'description', 'type', 'category', 'category_name',
            'preuve', 'user', 'user_name', 'group', 'group_name', 'is_group_transaction', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'user']
    
    def get_user_name(self, obj):
        """Retourne le nom complet de l'utilisateur"""
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def get_is_group_transaction(self, obj):
        """Indique si c'est une transaction de groupe"""
        return obj.group is not None
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def validate_amount(self, value):
        """Validation du montant"""
        if value <= 0:
            raise serializers.ValidationError("Amount must be positive")
        return value
    
    def validate_date(self, value):
        """Validation de la date"""
        if value > timezone.now():
            raise serializers.ValidationError("Transaction date cannot be in the future")
        return value
    
    def validate(self, data):
        """Validation croisée"""
        category = data.get('category')
        transaction_type = data.get('type')
        
        # Vérifier que la catégorie correspond au type de transaction
        if category and category.type != transaction_type:
            raise serializers.ValidationError(
                f"Category type ({category.type}) must match transaction type ({transaction_type})"
            )
        
        # Vérifier que l'utilisateur a accès au groupe s'il est spécifié
        group = data.get('group')
        if group:
            request = self.context.get('request')
            if request and not group.is_user_member(request.user):
                raise serializers.ValidationError("You are not a member of this group")
        
        return data
    
    def create(self, validated_data):
        """Créer une transaction"""
        request = self.context.get('request')
        if request:
            validated_data['user'] = request.user
        return super().create(validated_data)


class TransactionCreateSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour créer une transaction"""
    
    class Meta:
        model = Transaction
        fields = ['amount', 'date', 'description', 'type', 'category', 'preuve', 'group']
    
    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Amount must be positive")
        return value


class TransactionListSerializer(serializers.ModelSerializer):
    """Serializer simplifié pour lister les transactions"""
    user_name = serializers.SerializerMethodField()
    category_name = serializers.CharField(source='category.name', read_only=True)
    group_name = serializers.CharField(source='group.name', read_only=True)
    is_group_transaction = serializers.SerializerMethodField()
    
    class Meta:
        model = Transaction
        fields = [
            'id', 'amount', 'date', 'description', 'type', 
            'category_name', 'user_name', 'group_name', 'is_group_transaction', 'created_at'
        ]
    
    def get_user_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"
    
    def get_is_group_transaction(self, obj):
        """Indique si c'est une transaction de groupe"""
        return obj.group is not None


class TransactionStatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques de transactions"""
    total_income = serializers.DecimalField(max_digits=12, decimal_places=2)
    total_expenses = serializers.DecimalField(max_digits=12, decimal_places=2)
    balance = serializers.DecimalField(max_digits=12, decimal_places=2)
    transaction_count = serializers.IntegerField()
    income_count = serializers.IntegerField()
    expense_count = serializers.IntegerField()
    average_transaction = serializers.DecimalField(max_digits=12, decimal_places=2)
    period_start = serializers.DateTimeField()
    period_end = serializers.DateTimeField()


class TransactionCategoryStatsSerializer(serializers.Serializer):
    """Serializer pour les statistiques par catégorie"""
    category_name = serializers.CharField()
    category_type = serializers.CharField()
    total_amount = serializers.DecimalField(max_digits=12, decimal_places=2)
    transaction_count = serializers.IntegerField()
    percentage = serializers.DecimalField(max_digits=5, decimal_places=2)
