from rest_framework import permissions


class IsOwnerOrAdmin(permissions.BasePermission):
    """
    Permission pour les données financières: l'utilisateur peut seulement voir/modifier ses propres données
    ou être admin
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Admin peut tout faire
        if request.user.is_superuser:
            return True
        
        # L'utilisateur peut seulement accéder à ses propres données
        if hasattr(obj, 'user'):
            return obj.user == request.user
        
        # Si l'objet est l'utilisateur lui-même
        if obj == request.user:
            return True
            
        return False


class IsGroupMemberOrAdmin(permissions.BasePermission):
    """
    Permission pour les groupes: l'utilisateur doit être membre du groupe ou admin
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Admin peut tout faire
        if request.user.is_superuser:
            return True
        
        # Pour les objets liés à un groupe, vérifier si l'utilisateur est membre
        if hasattr(obj, 'group'):
            return obj.group.members.filter(user=request.user).exists()
        
        # Si l'objet est un groupe, vérifier si l'utilisateur est membre
        if hasattr(obj, 'members'):
            return obj.members.filter(user=request.user).exists()
            
        return False


class IsGroupAdminOrAdmin(permissions.BasePermission):
    """
    Permission pour administrer un groupe: l'utilisateur doit être admin du groupe ou superuser
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Superuser peut tout faire
        if request.user.is_superuser:
            return True
        
        # Pour les objets liés à un groupe, vérifier si l'utilisateur est admin du groupe
        if hasattr(obj, 'group'):
            return obj.group.members.filter(user=request.user, role='admin').exists()
        
        # Si l'objet est un groupe, vérifier si l'utilisateur est admin
        if hasattr(obj, 'members'):
            return obj.members.filter(user=request.user, role='admin').exists()
            
        return False


class ReadOnlyOrAdmin(permissions.BasePermission):
    """
    Permission en lecture seule pour tous, écriture pour admin seulement
    """
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return request.user.is_authenticated
        return request.user.is_authenticated and request.user.is_superuser