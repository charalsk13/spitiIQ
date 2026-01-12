from rest_framework.permissions import BasePermission, SAFE_METHODS


class IsNotAccountantOrReadOnly(BasePermission):
    """Allow read-only for accountants; full access for others."""

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True
        user = getattr(request, 'user', None)
        if not user or not user.is_authenticated:
            return False
        return getattr(user, 'role', 'owner') != 'accountant'
