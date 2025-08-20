from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    api, 
    UserViewSet, 
    GroupeFamilialViewSet, 
    CategorieViewSet, 
    MembreGroupeViewSet, 
    TransactionViewSet
)

# Configuration du routeur pour les ViewSets
router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'groupes-familiaux', GroupeFamilialViewSet)
router.register(r'categories', CategorieViewSet)
router.register(r'membres-groupe', MembreGroupeViewSet)
router.register(r'transactions', TransactionViewSet)

urlpatterns = [
    path('api/', api, name='api'),
    path('', include(router.urls)),
]