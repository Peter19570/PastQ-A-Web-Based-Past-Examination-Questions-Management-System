from rest_framework.permissions import BasePermission


class IsAdminUser(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_admin is True and request.user.is_active is True


class IsModerator(BasePermission):
    def has_permission(self, request, view):
        return request.user.is_moderator is True and request.user.is_active is True
