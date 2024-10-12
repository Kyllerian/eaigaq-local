# core/permissions.py

from rest_framework.permissions import BasePermission, SAFE_METHODS



class IsRegionHead(BasePermission):
    """
    Разрешает доступ только главным пользователям региона.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'REGION_HEAD'


class IsDepartmentHead(BasePermission):
    """
    Разрешает доступ только главным по отделению.
    """
    def has_permission(self, request, view):
        return request.user.is_authenticated and request.user.role == 'DEPARTMENT_HEAD'


class IsOwnerOrReadOnly(BasePermission):
    """
    Разрешает доступ к объекту только его владельцу или только для чтения.
    """
    def has_object_permission(self, request, view, obj):
        if request.method in SAFE_METHODS:
            return True
        return obj.investigator == request.user



class IsCreator(BasePermission):
    """
    Разрешение позволяет редактировать объект только его создателю.
    """
    def has_object_permission(self, request, view, obj):
        return obj.creator == request.user
