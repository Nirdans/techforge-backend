from rest_framework import serializers
from ..models import GroupeFamilial


class GroupeFamilialSerializer(serializers.ModelSerializer):
    """
    Serializer pour le modèle GroupeFamilial
    """
    class Meta:
        model = GroupeFamilial
        fields = ['id', 'nom', 'solde', 'created_at', 'updated_at']
