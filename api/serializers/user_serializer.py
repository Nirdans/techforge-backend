from rest_framework import serializers
from ..models import User


class UserSerializer(serializers.ModelSerializer):
    """
    Serializer pour le modèle User
    """
    class Meta:
        model = User
        fields = ['user_id', 'username', 'email', 'devise', 'solde', 'created_at', 'updated_at']
        extra_kwargs = {
            'password': {'write_only': True}
        }

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data)
        user.set_password(password)  # Hash du mot de passe
        user.save()
        return user
