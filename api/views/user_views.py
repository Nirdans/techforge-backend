from django.shortcuts import render
from django.http import JsonResponse
from rest_framework import viewsets
from ..models import User
from ..serializers import UserSerializer


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les utilisateurs
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
