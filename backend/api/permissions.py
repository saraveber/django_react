from rest_framework.permissions import BasePermission

class IsAdminOrStaffUser(BasePermission):
    """Allows access only to admin users."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and (request.user.groups.filter(name='admin').exists() or request.user.groups.filter(name='staff').exists()))


class IsAdminUser(BasePermission):
    """Allows access only to admin users."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.groups.filter(name='admin').exists())

class IsPlayerUser(BasePermission):
    """Allows access only to player users."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.groups.filter(name='player').exists())

class IsStaffUser(BasePermission):
    """Allows access only to staff users."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.groups.filter(name='staff').exists())
    
class IsOnlyUser(BasePermission):
    """Allows access only to staff users."""

    def has_permission(self, request, view):
        return bool(request.user and request.user.is_authenticated and request.user.groups.filter(name='user').exists())