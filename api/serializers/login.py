from rest_framework import serializers
import re

class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate_password(self, value):
        """Validate password format"""
        # Au moins une minuscule, une majuscule, un chiffre, un caractère spécial, et au moins 8 caractères
        if not re.match(r'^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$&!%?*])[A-Za-z\d@$&!%?*]{8,}$', value): 
            raise serializers.ValidationError('Password must contain at least 8 characters with 1 lowercase, 1 uppercase, 1 digit and 1 special character (@$&!%?*)')
        return value
