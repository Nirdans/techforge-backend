from django.urls import path, include
from rest_framework import routers
from rest_framework_simplejwt.views import TokenRefreshView

# Import des vues
from api.views import (
    UserModelViewSet,
    GroupViewSet,
    MemberViewSet,
    TransactionViewSet,
    CategoryViewSet,
    CustomTokenObtainPairView,
    RegisterView,
    LogoutView,
    ProfileView,
    ChangePasswordView,
    user_dashboard,
    PasswordResetView,
    PasswordResetConfirmView,
    PasswordResetValidateCodeView
)

# Configuration du router DRF
router = routers.DefaultRouter()
router.register(r'users', UserModelViewSet, basename='user')
router.register(r'groups', GroupViewSet, basename='group')
router.register(r'members', MemberViewSet, basename='member')
router.register(r'transactions', TransactionViewSet, basename='transaction')
router.register(r'categories', CategoryViewSet, basename='category')

# Routes de l'API
urlpatterns = [
    # API REST avec router
    path('', include(router.urls)),
    
    # Routes d'authentification JWT
    path('auth/login/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('auth/register/', RegisterView.as_view(), name='register'),
    path('auth/logout/', LogoutView.as_view(), name='logout'),
    
    # Gestion du profil
    path('auth/profile/', ProfileView.as_view(), name='profile'),
    path('auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
    path('auth/dashboard/', user_dashboard, name='user_dashboard'),
    
    # Réinitialisation de mot de passe
    path('auth/password-reset/request/', PasswordResetView.as_view(), name='password_reset_request'),
    path('auth/password-reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('auth/password-reset/validate-code/', PasswordResetValidateCodeView.as_view(), name='password_reset_validate_code'),
    
    # Authentification legacy (optionnel)
    path('api-auth/', include('rest_framework.urls')),
]