from django.shortcuts import render
from django.http import JsonResponse
from rest_framework import viewsets
from ..models import GroupeFamilial
from ..serializers import GroupeFamilialSerializer


class GroupeFamilialViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les groupes familiaux
    """
    queryset = GroupeFamilial.objects.all()
    serializer_class = GroupeFamilialSerializer
