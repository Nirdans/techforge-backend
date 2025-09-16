from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from api.encryption import hashPassword
from api.models import User

class UserCreateSerializer(serializers.ModelSerializer):
    """Serializer pour la création d'un nouvel utilisateur"""
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirmation = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['first_name', 'last_name', 'email', 'password', 'password_confirmation']
    
    def validate_email(self, value):
        """Vérifier que l'email n'existe pas déjà"""
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Un utilisateur avec cet email existe déjà.")
        return value
    
    def validate(self, data):
        """Valider la confirmation du mot de passe"""
        password = data.get('password')
        password_confirmation = data.get('password_confirmation')
        
        if password != password_confirmation:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas.")
        
        return data
    
    def create(self, validated_data):
        """Créer un nouvel utilisateur"""
        validated_data.pop('password_confirmation')
        password = validated_data.pop('password')
        
        user = User(**validated_data)
        user.set_password(password)  # Utilise le système Django par défaut
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    password_confirmation = serializers.CharField(write_only=True, required=False)
    
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'password', 'password_confirmation', 
                 'solde', 'date_joined', 'last_login', 'is_active']
        extra_kwargs = {
            'password': {'write_only': True},
            'date_joined': {'read_only': True},
            'last_login': {'read_only': True},
        }
    
    def validate(self, data):
        """Validate password confirmation if provided"""
        password = data.get('password')
        password_confirmation = data.get('password_confirmation')
        
        if password_confirmation and password != password_confirmation:
            raise serializers.ValidationError("Passwords don't match")
        
        return data
    
    def create(self, validated_data):
        # Remove password_confirmation from validated_data
        validated_data.pop('password_confirmation', None)
        password = validated_data.pop('password')
        
        user = User(**validated_data)
        user.password = hashPassword(password)
        user.save()
        return user
        
    def update(self, instance, validated_data):
        # Remove password_confirmation from validated_data
        validated_data.pop('password_confirmation', None)
        password = validated_data.pop('password', None)
        
        if password:
            instance.password = hashPassword(password)
            
        for key, value in validated_data.items():
            setattr(instance, key, value)
            
        instance.save()
        return instance
    
class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile with limited fields"""
    
    class Meta:
        model = User
        fields = ['id', 'first_name', 'last_name', 'email', 'solde', 'date_joined', 'last_login']
        read_only_fields = ['id', 'email', 'date_joined', 'last_login', 'solde']
    
    def update(self, instance, validated_data):
        """Update user profile (only name fields allowed)"""
        for key, value in validated_data.items():
            setattr(instance, key, value)
        instance.save()
        return instance


class LoginSerializer(serializers.Serializer):
    """Serializer pour l'authentification"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, style={'input_type': 'password'})
    
    class Meta:
        fields = ['email', 'password']
    
    def validate(self, data):
        """Valider les credentials"""
        from django.contrib.auth import authenticate
        
        email = data.get('email')
        password = data.get('password')
        
        if email and password:
            user = authenticate(email=email, password=password)
            if not user:
                raise serializers.ValidationError("Email ou mot de passe incorrect.")
            if not user.is_active:
                raise serializers.ValidationError("Ce compte est désactivé.")
            data['user'] = user
        else:
            raise serializers.ValidationError("Email et mot de passe requis.")
        
        return data


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer pour changer le mot de passe"""
    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, validators=[validate_password])
    new_password_confirmation = serializers.CharField(write_only=True)
    
    def validate(self, data):
        """Valider les mots de passe"""
        new_password = data.get('new_password')
        new_password_confirmation = data.get('new_password_confirmation')
        
        if new_password != new_password_confirmation:
            raise serializers.ValidationError("Les nouveaux mots de passe ne correspondent pas.")
        
        return data


class PasswordResetRequestSerializer(serializers.Serializer):
    """Serializer pour demander la réinitialisation de mot de passe"""
    email = serializers.EmailField()
    
    # Pas de validation ici car on gère le cas dans la vue pour des raisons de sécurité


class PasswordResetConfirmSerializer(serializers.Serializer):
    """Serializer pour confirmer la réinitialisation avec le code"""
    email = serializers.EmailField()
    code = serializers.CharField(max_length=6, min_length=6)
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirmation = serializers.CharField(write_only=True)
    
    def validate(self, data):
        """Valider le code et la confirmation du mot de passe"""
        password = data.get('password')
        password_confirmation = data.get('password_confirmation')
        
        if password != password_confirmation:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas.")
        
        return data


class PasswordResetSerializer(serializers.Serializer):
    """Serializer pour la demande de réinitialisation de mot de passe"""
    email = serializers.EmailField()
    
    def validate_email(self, value):
        """Vérifier que l'email existe"""
        if not User.objects.filter(email=value).exists():
            raise serializers.ValidationError("Aucun utilisateur trouvé avec cette adresse email.")
        return value


class PasswordResetTokenConfirmSerializer(serializers.Serializer):
    """Serializer pour la confirmation de réinitialisation de mot de passe"""
    token = serializers.CharField()
    password = serializers.CharField(write_only=True, validators=[validate_password])
    password_confirmation = serializers.CharField(write_only=True)
    
    def validate(self, data):
        """Valider la confirmation du mot de passe"""
        password = data.get('password')
        password_confirmation = data.get('password_confirmation')
        
        if password != password_confirmation:
            raise serializers.ValidationError("Les mots de passe ne correspondent pas.")
        
        return data
  