from django.shortcuts import render
from django.http import HttpResponse
from rest_framework import viewsets
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from rest_framework.authentication import SessionAuthentication
from api.filters.users import UserFilter
from api.models import User
from api.serializers import UserSerializer
from rest_framework.permissions import IsAuthenticated


# Create your views here.
class UserModelViewSet(viewsets.ModelViewSet):
    serializer_class = UserSerializer
    queryset = User.objects.all()
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = UserFilter
    search_fields = ('first_name', 'last_name', 'email')
    ordering_fields = ('first_name', 'last_name', 'email', 'date_joined', 'solde')
    ordering = ['-date_joined']  # Ordre par défaut
   # authentication_classes = [SessionAuthentication]
   # permission_classes = [IsAuthenticated]
  