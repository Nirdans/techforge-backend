from rest_framework import serializers
from ..models import Transaction


class TransactionSerializer(serializers.ModelSerializer):
    """
    Serializer pour le modèle Transaction
    """
    class Meta:
        model = Transaction
        fields = ['id', 'montant', 'date', 'description', 'type', 'categorie', 'justificatif', 'user', 'groupe_familial', 'created_at', 'updated_at']
