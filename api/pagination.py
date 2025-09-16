from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
import math


class CustomPageNumberPagination(PageNumberPagination):
    """
    Pagination personnalisée qui inclut le nombre total de pages
    """
    page_size = 3  # Nombre d'éléments par page (peut être modifié dans settings)
    page_size_query_param = 'page_size'
    max_page_size = 100
    
    def get_paginated_response(self, data):
        """
        Personnalise la réponse pour inclure le nombre total de pages
        """
        # Calculer le nombre total de pages
        total_pages = math.ceil(self.page.paginator.count / self.page.paginator.per_page) if self.page.paginator.count > 0 else 1
        
        return Response({
            'count': self.page.paginator.count,
            'total_pages': total_pages,
            'current_page': self.page.number,
            'page_size': self.page.paginator.per_page,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })


class LargeResultsSetPagination(PageNumberPagination):
    """
    Pagination pour de gros volumes de données
    """
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 1000
    
    def get_paginated_response(self, data):
        total_pages = math.ceil(self.page.paginator.count / self.page.paginator.per_page) if self.page.paginator.count > 0 else 1
        
        return Response({
            'count': self.page.paginator.count,
            'total_pages': total_pages,
            'current_page': self.page.number,
            'page_size': self.page.paginator.per_page,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })


class SmallResultsSetPagination(PageNumberPagination):
    """
    Pagination pour de petits volumes de données
    """
    page_size = 5
    page_size_query_param = 'page_size'
    max_page_size = 50
    
    def get_paginated_response(self, data):
        total_pages = math.ceil(self.page.paginator.count / self.page.paginator.per_page) if self.page.paginator.count > 0 else 1
        
        return Response({
            'count': self.page.paginator.count,
            'total_pages': total_pages,
            'current_page': self.page.number,
            'page_size': self.page.paginator.per_page,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'results': data
        })
