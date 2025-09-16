from rest_framework import status, permissions, serializers
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from django.core.mail import send_mail
from django.conf import settings
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
import string
import random
from datetime import datetime, timedelta
from django.utils import timezone
from api.models import User, PasswordResetCode
from api.serializers.user import (
    UserSerializer, 
    UserCreateSerializer, 
    LoginSerializer, 
    ChangePasswordSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer
)


def generate_reset_code():
    """Générer un code alphanumérique de 6 caractères"""
    characters = string.ascii_uppercase + string.digits
    return ''.join(random.choice(characters) for _ in range(6))


from rest_framework_simplejwt.serializers import TokenObtainPairSerializer

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Serializer personnalisé pour utiliser email au lieu de username"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Supprimer le champ username et ajouter email
        if 'username' in self.fields:
            del self.fields['username']
        
        self.fields['email'] = serializers.EmailField()
        
    def validate(self, attrs):
        # Utiliser email au lieu de username pour l'authentification
        email = attrs.get('email')
        password = attrs.get('password')
        
        if email and password:
            user = authenticate(request=self.context.get('request'),
                              email=email, password=password)
            
            if not user:
                msg = 'Impossible de se connecter avec les identifiants fournis.'
                raise serializers.ValidationError(msg, code='authorization')
                
            if not user.is_active:
                msg = 'Compte utilisateur désactivé.'
                raise serializers.ValidationError(msg, code='authorization')
                
            # Stocker l'utilisateur pour get_token
            self.user = user
            
        else:
            msg = 'Doit inclure "email" et "password".'
            raise serializers.ValidationError(msg, code='authorization')
            
        return {}
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        # Ajouter des claims personnalisés si nécessaire
        token['email'] = user.email
        token['first_name'] = user.first_name
        token['last_name'] = user.last_name
        return token


class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Vue personnalisée pour l'obtention des tokens JWT
    """
    serializer_class = CustomTokenObtainPairSerializer
    
    @swagger_auto_schema(
        operation_description="Connexion avec email et mot de passe",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'email': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    format=openapi.FORMAT_EMAIL,
                    description="Adresse email de l'utilisateur"
                ),
                'password': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    format=openapi.FORMAT_PASSWORD,
                    description="Mot de passe de l'utilisateur"
                )
            },
            required=['email', 'password']
        ),
        responses={
            200: openapi.Response(
                description="Connexion réussie",
                examples={
                    "application/json": {
                        "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                        "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                        "user": {
                            "id": 1,
                            "first_name": "John",
                            "last_name": "Doe",
                            "email": "john.doe@example.com",
                            "solde": "0.00"
                        }
                    }
                }
            ),
            401: "Identifiants invalides"
        }
    )
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        try:
            serializer.is_valid(raise_exception=True)
        except serializers.ValidationError:
            return Response({'detail': 'Identifiants invalides'}, status=status.HTTP_401_UNAUTHORIZED)
        
        user = serializer.user
        refresh = self.get_serializer_class().get_token(user)
        
        return Response({
            'refresh': str(refresh),
            'access': str(refresh.access_token),
            'user': UserSerializer(user).data
        })


class RegisterView(APIView):
    """
    Vue pour l'inscription des nouveaux utilisateurs
    """
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_description="Créer un nouveau compte utilisateur",
        request_body=UserCreateSerializer,
        responses={
            201: openapi.Response(
                description="Utilisateur créé avec succès",
                examples={
                    "application/json": {
                        "message": "Utilisateur créé avec succès",
                        "user": {
                            "id": 1,
                            "first_name": "John",
                            "last_name": "Doe",
                            "email": "john.doe@example.com",
                            "solde": "0.00",
                            "is_active": True
                        },
                        "tokens": {
                            "refresh": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
                            "access": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
                        }
                    }
                }
            ),
            400: "Données invalides"
        }
    )
    def post(self, request):
        serializer = UserCreateSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            
            # Générer les tokens JWT
            refresh = RefreshToken.for_user(user)
            access_token = refresh.access_token
            
            return Response({
                'message': 'Utilisateur créé avec succès',
                'user': UserSerializer(user).data,
                'tokens': {
                    'refresh': str(refresh),
                    'access': str(access_token),
                }
            }, status=status.HTTP_201_CREATED)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LogoutView(APIView):
    """
    Vue pour la déconnexion (blacklist du refresh token)
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Déconnexion et invalidation du refresh token",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'refresh_token': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Token de rafraîchissement à invalider"
                )
            },
            required=['refresh_token']
        ),
        responses={
            200: openapi.Response(
                description="Déconnexion réussie",
                examples={
                    "application/json": {
                        "message": "Déconnexion réussie"
                    }
                }
            ),
            400: "Token invalide ou manquant"
        }
    )
    def post(self, request):
        try:
            refresh_token = request.data.get('refresh_token')
            if refresh_token:
                token = RefreshToken(refresh_token)
                token.blacklist()
                return Response({
                    'message': 'Déconnexion réussie'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Refresh token requis'
                }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({
                'error': 'Token invalide'
            }, status=status.HTTP_400_BAD_REQUEST)


class ProfileView(APIView):
    """
    Vue pour voir et modifier le profil utilisateur
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Récupérer le profil de l'utilisateur connecté",
        responses={
            200: UserSerializer,
        }
    )
    def get(self, request):
        """Récupérer le profil de l'utilisateur connecté"""
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

    @swagger_auto_schema(
        operation_description="Mettre à jour le profil complet",
        request_body=UserSerializer,
        responses={
            200: UserSerializer,
            400: "Données invalides"
        }
    )
    def put(self, request):
        """Mettre à jour le profil de l'utilisateur connecté"""
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        operation_description="Mettre à jour partiellement le profil",
        request_body=UserSerializer,
        responses={
            200: UserSerializer,
            400: "Données invalides"
        }
    )
    def patch(self, request):
        """Mettre à jour partiellement le profil de l'utilisateur connecté"""
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    """
    Vue pour changer le mot de passe
    """
    permission_classes = [permissions.IsAuthenticated]

    @swagger_auto_schema(
        operation_description="Changer le mot de passe de l'utilisateur connecté",
        request_body=ChangePasswordSerializer,
        responses={
            200: openapi.Response(
                description="Mot de passe changé avec succès",
                examples={
                    "application/json": {
                        "message": "Mot de passe changé avec succès"
                    }
                }
            ),
            400: "Données invalides ou ancien mot de passe incorrect"
        }
    )
    def post(self, request):
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            old_password = serializer.validated_data.get('old_password')
            new_password = serializer.validated_data.get('new_password')

            if not user.check_password(old_password):
                return Response({
                    'error': 'Ancien mot de passe incorrect'
                }, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save()

            return Response({
                'message': 'Mot de passe changé avec succès'
            }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@swagger_auto_schema(
    method='get',
    operation_description="Dashboard utilisateur avec statistiques et données récentes",
    responses={
        200: openapi.Response(
            description="Dashboard utilisateur",
            examples={
                "application/json": {
                    "user": {
                        "id": 1,
                        "first_name": "John",
                        "last_name": "Doe",
                        "email": "john.doe@example.com",
                        "solde": "150.50"
                    },
                    "statistics": {
                        "total_groups": 3,
                        "total_transactions": 15,
                        "total_balance": "150.50"
                    },
                    "recent_transactions": [],
                    "active_groups": []
                }
            }
        )
    }
)
@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def user_dashboard(request):
    """
    Dashboard utilisateur avec statistiques de base
    """
    user = request.user
    
    # Statistiques de base
    total_groups = user.memberships.count()
    total_transactions = user.transactions.count()
    total_balance = user.solde
    
    # Transactions récentes (si des transactions existent)
    recent_transactions = []
    if hasattr(user, 'transactions'):
        recent_transactions = user.transactions.order_by('-date')[:5]
    
    # Groupes actifs (si des groupes existent)
    active_groups = []
    if hasattr(user, 'memberships'):
        active_groups = user.memberships.select_related('group')[:5]
    
    dashboard_data = {
        'user': UserSerializer(user).data,
        'statistics': {
            'total_groups': total_groups,
            'total_transactions': total_transactions,
            'total_balance': str(total_balance),
        },
        'recent_transactions': [
            {
                'id': t.id,
                'amount': str(t.amount),
                'description': t.description,
                'date': t.date,
                'type': t.type,
            } for t in recent_transactions
        ],
        'active_groups': [
            {
                'id': m.group.id,
                'name': m.group.name,
                'role': m.role,
                'amount': str(m.group.amount),
            } for m in active_groups
        ]
    }
    
    return Response(dashboard_data)


class PasswordResetView(APIView):
    """
    Vue pour demander la réinitialisation de mot de passe
    """
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_description="Demander la réinitialisation de mot de passe par email",
        request_body=PasswordResetRequestSerializer,
        responses={
            200: openapi.Response(
                description="Email de réinitialisation envoyé",
                examples={
                    "application/json": {
                        "message": "Un email de réinitialisation a été envoyé à votre adresse."
                    }
                }
            ),
            400: "Email invalide ou non trouvé"
        }
    )
    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            try:
                user = User.objects.get(email=email)
                
                # Supprimer les anciens codes de réinitialisation pour cet utilisateur
                PasswordResetCode.objects.filter(user=user).delete()
                
                # Générer un nouveau code alphanumérique de 6 caractères
                reset_code = generate_reset_code()
                
                # Créer l'enregistrement du code avec expiration (10 minutes)
                expiry_time = timezone.now() + timedelta(minutes=20)
                PasswordResetCode.objects.create(
                    user=user,
                    code=reset_code,
                    expires_at=expiry_time
                )
                
                # Envoyer l'email avec le code
                subject = "Code de réinitialisation de mot de passe - E-Finance"
                message = f"""
                Bonjour {user.first_name},

                Vous avez demandé la réinitialisation de votre mot de passe sur E-Finance.

                Votre code de vérification est : {reset_code}

                Ce code est valide pendant 20 minutes.

                Si vous n'avez pas demandé cette réinitialisation, ignorez simplement cet email.

                Cordialement,
                L'équipe E-Finance
                                """
                
                send_mail(
                    subject,
                    message,
                    settings.DEFAULT_FROM_EMAIL,
                    [email],
                    fail_silently=False,
                )
                
                return Response({
                    'message': 'Un code de réinitialisation a été envoyé à votre adresse email.'
                }, status=status.HTTP_200_OK)
                
            except User.DoesNotExist:
                # Pour des raisons de sécurité, on renvoie le même message
                return Response({
                    'message': 'Un email de réinitialisation a été envoyé à votre adresse.'
                }, status=status.HTTP_200_OK)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetConfirmView(APIView):
    """
    Vue pour confirmer la réinitialisation de mot de passe
    """
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_description="Confirmer la réinitialisation de mot de passe avec le code",
        request_body=PasswordResetConfirmSerializer,
        responses={
            200: openapi.Response(
                description="Mot de passe réinitialisé avec succès",
                examples={
                    "application/json": {
                        "message": "Votre mot de passe a été réinitialisé avec succès."
                    }
                }
            ),
            400: "Code invalide ou expiré"
        }
    )
    def post(self, request):
        serializer = PasswordResetConfirmSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data['email']
            code = serializer.validated_data['code']
            password = serializer.validated_data['password']
            
            try:
                user = User.objects.get(email=email)
                
                # Vérifier le code de réinitialisation
                reset_code = PasswordResetCode.objects.filter(
                    user=user,
                    code=code,
                    expires_at__gt=timezone.now(),
                    is_used=False
                ).first()
                
                if reset_code:
                    # Réinitialiser le mot de passe
                    user.set_password(password)
                    user.save()
                    
                    # Marquer le code comme utilisé
                    reset_code.is_used = True
                    reset_code.save()
                    
                    # Supprimer tous les autres codes pour cet utilisateur
                    PasswordResetCode.objects.filter(user=user).delete()
                    
                    return Response({
                        'message': 'Votre mot de passe a été réinitialisé avec succès.'
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'error': 'Code invalide ou expiré'
                    }, status=status.HTTP_400_BAD_REQUEST)
                    
            except User.DoesNotExist:
                return Response({
                    'error': 'Email invalide'
                }, status=status.HTTP_400_BAD_REQUEST)
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PasswordResetValidateCodeView(APIView):
    """
    Vue pour valider un code de réinitialisation
    """
    permission_classes = [permissions.AllowAny]

    @swagger_auto_schema(
        operation_description="Valider un code de réinitialisation de mot de passe",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'email': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    format=openapi.FORMAT_EMAIL,
                    description="Email de l'utilisateur"
                ),
                'code': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Code de vérification à 6 caractères"
                )
            },
            required=['email', 'code']
        ),
        responses={
            200: openapi.Response(
                description="Code valide",
                examples={
                    "application/json": {
                        "valid": True,
                        "message": "Code valide"
                    }
                }
            ),
            400: "Code invalide ou expiré"
        }
    )
    def post(self, request):
        email = request.data.get('email')
        code = request.data.get('code')
        
        if not email or not code:
            return Response({
                'valid': False,
                'error': 'Email et code requis'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            
            # Vérifier le code de réinitialisation
            reset_code = PasswordResetCode.objects.filter(
                user=user,
                code=code,
                expires_at__gt=timezone.now(),
                is_used=False
            ).first()
            
            if reset_code:
                return Response({
                    'valid': True,
                    'message': 'Code valide'
                }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'valid': False,
                    'error': 'Code invalide ou expiré'
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except User.DoesNotExist:
            return Response({
                'valid': False,
                'error': 'Email invalide'
            }, status=status.HTTP_400_BAD_REQUEST)
