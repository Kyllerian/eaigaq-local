# eaigaq_project/core/admin.py

from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.translation import gettext_lazy as _
from .models import (
    User,
    Department,
    Case,
    MaterialEvidence,
    MaterialEvidenceEvent,
    Session,
    Camera,
    AuditEntry,
    Document
)


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    # Поля для отображения в списке пользователей
    list_display = (
        'username', 'email', 'first_name', 'last_name',
        'is_staff', 'is_active', 'rank', 'phone_number', 'department', 'region', 'role'
    )

    # Поля для фильтрации
    list_filter = (
        'is_staff', 'is_superuser', 'is_active', 'groups', 'department', 'region', 'role'
    )

    # Поля для редактирования пользователя
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        (_('Персональная информация'), {
            'fields': (
                'first_name', 'last_name', 'email', 'phone_number',
                'rank', 'department', 'region', 'role'
            )
        }),
        (_('Права доступа'), {
            'fields': (
                'is_active', 'is_staff', 'is_superuser', 'groups', 'user_permissions'
            )
        }),
        (_('Важные даты'), {'fields': ('last_login', 'date_joined')}),
    )

    # Поля для создания нового пользователя
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': (
                'username', 'password1', 'password2',
                'first_name', 'last_name', 'email', 'phone_number',
                'rank', 'department', 'region', 'role',
                'is_active', 'is_staff', 'is_superuser'
            ),
        }),
    )

    search_fields = ('username', 'first_name', 'last_name', 'email')
    ordering = ('username',)

@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ('name', 'region', 'evidence_group_count')
    search_fields = ('name',)
    list_filter = ('region',)
    readonly_fields = ('evidence_group_count',)  # Поле только для чтения

    fieldsets = (
        (None, {
            'fields': ('name', 'region', 'evidence_group_count')
        }),
    )

# @admin.register(Department)
# class DepartmentAdmin(admin.ModelAdmin):
#     list_display = ('name', 'region')
#     search_fields = ('name',)
#     list_filter = ('region',)
#

@admin.register(Case)
class CaseAdmin(admin.ModelAdmin):
    list_display = ('name', 'investigator', 'active', 'created', 'updated')
    search_fields = ('name', 'description')
    list_filter = ('active', 'created', 'updated')



@admin.register(MaterialEvidence)
class MaterialEvidenceAdmin(admin.ModelAdmin):
    list_display = ('name', 'case', 'status', 'type', 'created', 'updated', 'active')
    list_filter = ('status', 'type', 'active')
    search_fields = ('name', 'description', 'barcode')
    readonly_fields = ('barcode', 'created', 'updated')
    fieldsets = (
        (None, {
            'fields': ('name', 'description', 'case', 'group', 'status', 'type', 'barcode')
        }),
        ('Дополнительная информация', {
            'fields': ('created_by', 'created', 'updated', 'active')
        }),
    )


@admin.register(MaterialEvidenceEvent)
class MaterialEvidenceEventAdmin(admin.ModelAdmin):
    list_display = ('material_evidence', 'action', 'user', 'created')
    search_fields = ('material_evidence__name', 'action', 'user__username')
    list_filter = ('action', 'created')


@admin.register(Session)
class SessionAdmin(admin.ModelAdmin):
    list_display = ('user', 'login', 'logout', 'active')
    search_fields = ('user__username',)
    list_filter = ('active', 'login', 'logout')


@admin.register(Camera)
class CameraAdmin(admin.ModelAdmin):
    list_display = ('name', 'device_id', 'active', 'created', 'updated')
    search_fields = ('name', 'device_id')
    list_filter = ('active', 'created', 'updated')

# @admin.register(Camera)
# class CameraAdmin(admin.ModelAdmin):
#     list_display = ('name', 'device_id', 'type', 'active', 'created', 'updated')
#     search_fields = ('name', 'device_id')
#     list_filter = ('type', 'active', 'created', 'updated')


@admin.register(AuditEntry)
class AuditEntryAdmin(admin.ModelAdmin):
    list_display = (
        'object_id', 'table_name', 'class_name', 'action', 'user', 'created'
    )
    search_fields = ('table_name', 'class_name', 'action', 'user__username')
    list_filter = ('action', 'created')

@admin.register(Document)
class DocumentAdmin(admin.ModelAdmin):
    list_display = (
        'id', 'file', 'uploaded_by', 'uploaded_at', 'case', 'material_evidence', 'description'
    )
    search_fields = ('description', 'file')
    list_filter = ('uploaded_at', 'uploaded_by')
    readonly_fields = ('uploaded_at', 'uploaded_by')

    def save_model(self, request, obj, form, change):
        if not obj.uploaded_by:
            obj.uploaded_by = request.user
        super().save_model(request, obj, form, change)