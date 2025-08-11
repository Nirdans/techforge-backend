from django.shortcuts import render
from django.http import JsonResponse

# Create your views here.

def api(request):
    users=[
        {'id': 1, 'name': 'Alice'},
    ]
    return JsonResponse(users)