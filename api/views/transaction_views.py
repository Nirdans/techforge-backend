from django.shortcuts import render
from django.http import JsonResponse
from rest_framework import viewsets
from ..models import Transaction
from ..serializers import TransactionSerializer


class TransactionViewSet(viewsets.ModelViewSet):
    """
    ViewSet pour gérer les transactions
    """
    queryset = Transaction.objects.all()
    serializer_class = TransactionSerializer
