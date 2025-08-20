from django.shortcuts import render
from django.http import JsonResponse


def api(request):
    users = [
        {'id': 1, 'name': 'Alice'},
    ]
    return JsonResponse(users, safe=False)
