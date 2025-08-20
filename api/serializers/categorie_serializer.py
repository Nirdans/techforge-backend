from rest_framework import serializers
from ..models import Categorie


class CategorieSerializer(serializers.ModelSerializer):
    """
    Serializer pour le modèle Categorie
    """
    class Meta:
        model = Categorie
        fields = ['id', 'nom', 'type', 'user', 'groupe_familial', 'created_at', 'updated_at']
