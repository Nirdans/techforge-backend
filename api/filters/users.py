import django_filters
from django.db.models import Q
from api.models import User

class UserFilter(django_filters.FilterSet):
    # Search by name (first_name or last_name)
    name = django_filters.CharFilter(method='filter_by_name', label='Name')
    
    # Filter by solde range
    solde_min = django_filters.NumberFilter(field_name='solde', lookup_expr='gte', label='Minimum Balance')
    solde_max = django_filters.NumberFilter(field_name='solde', lookup_expr='lte', label='Maximum Balance')
    
    # Filter by activity status
    is_active = django_filters.BooleanFilter(field_name='is_active', label='Is Active')
    
    # Filter by date joined range
    date_joined_after = django_filters.DateFilter(field_name='date_joined', lookup_expr='gte', label='Joined After')
    date_joined_before = django_filters.DateFilter(field_name='date_joined', lookup_expr='lte', label='Joined Before')
    
    # Filter by last login
    last_login_after = django_filters.DateFilter(field_name='last_login', lookup_expr='gte', label='Last Login After')
    
    # Filter by membership in groups (your custom Group model)
    has_groups = django_filters.BooleanFilter(method='filter_has_groups', label='Has Groups')
    
    class Meta:
        model = User
        fields = {
            'email': ['icontains', 'exact'],
            'first_name': ['icontains'],
            'last_name': ['icontains'],
            'is_active': ['exact'],
            'is_superuser': ['exact'],
        }
    
    def filter_by_name(self, queryset, name, value):
        """Filter by first_name or last_name containing the value"""
        return queryset.filter(
            Q(first_name__icontains=value) | Q(last_name__icontains=value)
        )
    
    def filter_has_groups(self, queryset, name, value):
        """Filter users who are members of at least one group"""
        if value:
            return queryset.filter(memberships__isnull=False).distinct()
        else:
            return queryset.filter(memberships__isnull=True)