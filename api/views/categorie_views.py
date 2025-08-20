from django.shortcuts import render
from django.http import JsonResponse
from rest_framework import viewsets
from ..models import Categorie
from ..serializers import CategorieSerializer


class CategorieViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les catégories
    """
    queryset = Categorie.objects.all()
    serializer_class = CategorieSerializer
