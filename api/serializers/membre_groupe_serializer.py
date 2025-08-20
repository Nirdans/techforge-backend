from rest_framework import serializers
from ..models import MembreGroupe


class MembreGroupeSerializer(serializers.ModelSerializer):
    """
    Serializer pour le modèle MembreGroupe
    """
    class Meta:
        model = MembreGroupe
        fields = ['id', 'user', 'groupe', 'role', 'solde_individuel', 'date_join', 'created_at', 'updated_at']
