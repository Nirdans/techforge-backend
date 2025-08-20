from django.shortcuts import render
from django.http import JsonResponse
from rest_framework import viewsets
from ..models import MembreGroupe
from ..serializers import MembreGroupeSerializer


class MembreGroupeViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les membres de groupe
    """
    queryset = MembreGroupe.objects.all()
    serializer_class = MembreGroupeSerializer
