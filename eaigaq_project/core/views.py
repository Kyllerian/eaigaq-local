# eaigaq_project/core/views.py

from django.utils import timezone
from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse, FileResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.db.models import Q
from django.forms.models import model_to_dict
import os
from django.conf import settings

from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.pagination import PageNumberPagination
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser  # Добавлено для обработки файлов

import json

from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import (
    api_view,
    permission_classes,
    action,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.filters import SearchFilter

from .permissions import IsCreator, IsRegionHead, IsDepartmentHead
from .models import (
    User,
    Department,
    Case,
    MaterialEvidence,
    MaterialEvidenceEvent,
    Session,
    Camera,
    AuditEntry,
    EvidenceGroup,
    FaceEncoding,
    Document,  # Импортируем модель Document
)
# Добавляем импорт нашей модели "CameraViewingSession"
from .models import CameraViewingSession

from .serializers import (
    UserSerializer,
    DepartmentSerializer,
    CaseSerializer,
    MaterialEvidenceSerializer,
    MaterialEvidenceEventSerializer,
    SessionSerializer,
    CameraSerializer,
    AuditEntrySerializer,
    EvidenceGroupSerializer,
    FaceEncodingSerializer,
    BiometricRegistrationSerializer,
    DocumentSerializer,  # Импортируем DocumentSerializer
    CameraViewingSessionSerializer  # Добавляем сериализатор для CameraViewingSession
)


class StandardResultsSetPagination(PageNumberPagination):
    page_size_query_param = 'page_size'
    max_page_size = 10000  # Максимальное количество элементов на странице


# ---------------------------
# ViewSets for models
# ---------------------------

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'is_active': ['exact'],        # Фильтрация по активному статусу
        'date_joined': ['gte', 'lte'], # Фильтрация по дате регистрации
        'department': ['exact'],       # Фильтрация по отделению
        'region': ['exact'],           # Фильтрация по региону
        'role': ['exact'],             # Фильтрация по роли
    }
    search_fields = [
        'username',
        'first_name',
        'last_name',
        'email',
        'phone_number',
        'rank',
        'department__name',
        'region',
        'role',
    ]
    ordering_fields = [
        'date_joined', 'last_login', 'username', 'first_name',
        'last_name', 'email', 'phone_number', 'rank'
    ]
    ordering = ['-date_joined']  # Сортировка по умолчанию

    def get_queryset(self):
        user = self.request.user
        base_q_filter = Q()

        if user.role == "REGION_HEAD":
            base_q_filter &= Q(region=user.region)
        elif user.role == "DEPARTMENT_HEAD":
            base_q_filter &= Q(department=user.department)
        else:
            base_q_filter &= Q(id=user.id)

        search_query = self.request.query_params.get('search', '').strip()
        department_id = self.request.query_params.get('department')
        region = self.request.query_params.get('region')

        if department_id:
            base_q_filter &= Q(department_id=department_id)

            if user.role == "REGION_HEAD":
                try:
                    dept = Department.objects.get(id=department_id)
                    if dept.region != user.region:
                        raise PermissionDenied("Вы не можете просматривать данные этого отделения.")
                except Department.DoesNotExist:
                    raise ValidationError({"detail": "Указанное отделение не найдено."})

            elif user.role == "DEPARTMENT_HEAD":
                if int(department_id) != user.department.id:
                    raise PermissionDenied("Вы не можете просматривать данные другого отделения.")

        if region:
            if user.role == "REGION_HEAD":
                if region != user.region:
                    raise PermissionDenied("Вы не можете просматривать данные другого региона.")
                base_q_filter &= Q(region=region)

        if search_query:
            q_objects = Q(
                Q(username__icontains=search_query) |
                Q(first_name__icontains=search_query) |
                Q(last_name__icontains=search_query) |
                Q(email__icontains=search_query) |
                Q(phone_number__icontains=search_query) |
                Q(rank__icontains=search_query) |
                Q(department__name__icontains=search_query) |
                Q(region__icontains=search_query) |
                Q(role__icontains=search_query)
            )
            base_q_filter &= q_objects

        queryset = User.objects.filter(base_q_filter).distinct()
        queryset = queryset.select_related('department')

        return queryset

    def perform_create(self, serializer):
        user = self.request.user

        if user.role == "REGION_HEAD":
            new_user_region = serializer.validated_data.get("region")
            department = serializer.validated_data.get("department")

            if department and department.region != user.region:
                raise PermissionDenied(
                    "Вы не можете назначить пользователя в отделение другого региона."
                )

            if not new_user_region:
                serializer.validated_data["region"] = user.region
            else:
                if new_user_region != user.region:
                    raise PermissionDenied(
                        "Вы не можете создавать пользователей в другом регионе."
                    )

            serializer.save()

        elif user.role == "DEPARTMENT_HEAD":
            department = user.department
            serializer.validated_data["department"] = department
            serializer.validated_data["role"] = "USER"

            serializer.validated_data.pop("region", None)
            serializer.save()

        else:
            raise PermissionDenied("У вас нет прав для создания пользователей.")

    def update(self, request, *args, **kwargs):
        user = request.user
        instance = self.get_object()

        if "is_active" in request.data:
            if user.role == "REGION_HEAD":
                if instance.region != user.region:
                    raise PermissionDenied(
                        "Вы не можете изменять статус этого пользователя."
                    )
            elif user.role == "DEPARTMENT_HEAD":
                if instance.department != user.department:
                    raise PermissionDenied(
                        "Вы не можете изменять статус этого пользователя."
                    )
            else:
                raise PermissionDenied(
                    "У вас нет прав для изменения этого пользователя."
                )

        if "role" in request.data and user.role == "DEPARTMENT_HEAD":
            if request.data["role"] != "USER":
                raise PermissionDenied(
                    "Вы не можете изменять роль пользователя."
                )

        return super().update(request, *args, **kwargs)

    @action(detail=False, methods=["get"])
    def all_departments(self, request):
        user = self.request.user
        if user.role == "REGION_HEAD":
            departments = Department.objects.filter(region=user.region)
            serializer = DepartmentSerializer(departments, many=True)
            return Response(serializer.data)
        else:
            raise PermissionDenied("У вас нет прав для доступа к этому ресурсу.")


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['region', 'evidence_group_count']
    ordering_fields = ['evidence_group_count']

    def get_permissions(self):
        user = self.request.user
        if user.role == "REGION_HEAD":
            permission_classes = [IsAuthenticated, IsRegionHead]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        if user.role == "REGION_HEAD":
            return Department.objects.filter(region=user.region)
        else:
            self.permission_denied(
                self.request, message="Недостаточно прав для доступа к отделениям"
            )

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == "REGION_HEAD":
            serializer.save(region=user.region)
        else:
            self.permission_denied(
                self.request, message="Недостаточно прав для создания отделения"
            )


class CaseViewSet(viewsets.ModelViewSet):
    queryset = Case.objects.all()
    serializer_class = CaseSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'active': ['exact'],
        'created': ['gte', 'lte'],
        'department': ['exact'],
        'status': ['exact'],
    }
    search_fields = [
        'name',
        'description',
        'creator__first_name',
        'creator__last_name',
        'creator__username',
        'investigator__first_name',
        'investigator__last_name',
        'investigator__username',
        'status',
    ]
    ordering_fields = ['created', 'updated', 'status']
    ordering = ['-created']

    def get_queryset(self):
        user = self.request.user
        search_query = self.request.query_params.get("search", "").strip()
        department_id = self.request.query_params.get("department")

        base_q_filter = Q()

        if user.role == "REGION_HEAD":
            base_q_filter &= Q(department__region=user.region)
        elif user.role == "DEPARTMENT_HEAD":
            base_q_filter &= Q(department=user.department)
        else:
            base_q_filter &= Q(creator=user) | Q(investigator=user)

        if department_id:
            base_q_filter &= Q(department_id=department_id)

            if user.role == "REGION_HEAD":
                try:
                    dept = Department.objects.get(id=department_id)
                    if dept.region != user.region:
                        raise PermissionDenied("Вы не можете просматривать данные этого отделения.")
                except Department.DoesNotExist:
                    raise ValidationError({"detail": "Указанное отделение не найдено."})

            elif user.role == "DEPARTMENT_HEAD":
                if int(department_id) != user.department.id:
                    raise PermissionDenied("Вы не можете просматривать данные другого отделения.")

        if search_query:
            q_objects = Q()
            if search_query.isdigit() and len(search_query) == 13:
                material_evidences = MaterialEvidence.objects.filter(barcode=search_query)
                case_ids_from_evidences = material_evidences.values_list("case_id", flat=True)

                evidence_groups = EvidenceGroup.objects.filter(barcode=search_query)
                case_ids_from_groups = evidence_groups.values_list("case_id", flat=True)

                case_ids = set(case_ids_from_evidences) | set(case_ids_from_groups)
                if case_ids:
                    q_objects |= Q(id__in=case_ids)
                else:
                    q_objects = Q(pk__in=[])
            else:
                q_objects |= Q(
                    Q(name__icontains=search_query) |
                    Q(description__icontains=search_query) |
                    Q(creator__first_name__icontains=search_query) |
                    Q(creator__last_name__icontains=search_query) |
                    Q(creator__username__icontains=search_query) |
                    Q(investigator__first_name__icontains=search_query) |
                    Q(investigator__last_name__icontains=search_query) |
                    Q(investigator__username__icontains=search_query) |
                    Q(status__icontains=search_query)
                )
            base_q_filter &= q_objects

        queryset = Case.objects.filter(base_q_filter).distinct()
        return queryset.select_related("creator", "investigator", "department")

    def perform_create(self, serializer):
        user = self.request.user
        if not user.department:
            raise PermissionDenied("У вас нет назначенного отделения для создания дела.")
        serializer.save(creator=user, investigator=user, department=user.department)

    def update(self, request, *args, **kwargs):
        user = request.user
        instance = self.get_object()
        old_instance = model_to_dict(instance)

        data = request.data
        updated_fields = set(data.keys())
        ignored_fields = {'department_id', 'department'}
        updated_fields -= ignored_fields

        for field in ['investigator', 'creator']:
            if field in updated_fields:
                new_user_id = data.get(field)
                try:
                    new_user = User.objects.get(id=new_user_id)
                except User.DoesNotExist:
                    raise ValidationError({field: f"Указанный пользователь для поля '{field}' не найден."})

                if user.role == 'REGION_HEAD':
                    if new_user.region != user.region:
                        raise PermissionDenied(
                            f"Вы можете назначать только пользователей из вашего региона для поля '{field}'.")
                elif user.role == 'DEPARTMENT_HEAD':
                    if new_user.department != user.department:
                        raise PermissionDenied(
                            f"Вы можете назначать только пользователей из вашего отделения для поля '{field}'.")
                else:
                    raise PermissionDenied(f"Вы не можете менять поле '{field}'.")

        allowed_fields = {'name', 'description', 'active', 'investigator', 'creator', 'status'}
        if user.role not in ['REGION_HEAD', 'DEPARTMENT_HEAD']:
            if instance.investigator != user:
                raise PermissionDenied("Вы не являетесь следователем этого дела.")
            disallowed_fields = updated_fields - allowed_fields
            if disallowed_fields:
                raise PermissionDenied(f"Вы не можете обновлять поля: {', '.join(disallowed_fields)}")
            else:
                if 'status' in updated_fields:
                    raise PermissionDenied("Вы не можете изменять поле 'status'.")
        else:
            disallowed_fields = updated_fields - allowed_fields
            if disallowed_fields:
                raise PermissionDenied(f"Вы не можете обновлять поля: {', '.join(disallowed_fields)}")

        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        new_instance = self.get_object()
        new_instance_dict = model_to_dict(new_instance)

        changes = {}
        for field in new_instance_dict.keys():
            old_value = old_instance.get(field)
            new_value = new_instance_dict.get(field)
            if old_value != new_value:
                if field in ['investigator', 'creator']:
                    old_user = User.objects.filter(id=old_value).first() if old_value else None
                    new_user_ = User.objects.filter(id=new_value).first() if new_value else None
                    old_value_display = (f"{old_user.get_full_name()} - ({old_user.rank})"
                                         if old_user else None)
                    new_value_display = (f"{new_user_.get_full_name()} - ({new_user_.rank})"
                                         if new_user_ else None)
                    changes[field] = {'old': old_value_display, 'new': new_value_display}
                elif field == 'status':
                    old_value_display = instance.get_status_display()
                    new_value_display = new_instance.get_status_display()
                    changes[field] = {'old': old_value_display, 'new': new_value_display}
                else:
                    changes[field] = {'old': old_value, 'new': new_value}

        if changes:
            AuditEntry.objects.create(
                object_id=instance.id,
                object_name=instance.name,
                table_name='case',
                class_name='Case',
                action='update',
                fields=', '.join(changes.keys()),
                data=json.dumps(changes, ensure_ascii=False, default=str),
                user=user,
                case=instance
            )

        return Response(serializer.data)

    @action(detail=False, methods=["get"])
    def get_by_barcode(self, request):
        barcode = request.query_params.get("barcode")
        if not barcode:
            return Response({"detail": "Требуется штрихкод."}, status=400)

        user = request.user

        material_evidence = MaterialEvidence.objects.filter(barcode=barcode).first()
        evidence_group = EvidenceGroup.objects.filter(barcode=barcode).first()

        case = None
        if material_evidence:
            case = material_evidence.case
        elif evidence_group:
            case = evidence_group.case

        if not case:
            return Response({"detail": "Дело не найдено."}, status=404)

        if user.role == "REGION_HEAD" and case.department.region != user.region:
            raise PermissionDenied("У вас нет прав для доступа к этому делу.")
        elif user.role == "DEPARTMENT_HEAD" and case.department != user.department:
            raise PermissionDenied("У вас нет прав для доступа к этому делу.")
        elif user.role == "USER" and case.creator != user and case.investigator != user:
            raise PermissionDenied("У вас нет прав для доступа к этому делу.")

        serializer = self.get_serializer(case)
        return Response(serializer.data)


class MaterialEvidenceViewSet(viewsets.ModelViewSet):
    queryset = MaterialEvidence.objects.all()
    serializer_class = MaterialEvidenceSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'type': ['exact'],
        'created': ['gte', 'lte'],
        'status': ['exact'],
        'case__department': ['exact'],
        'case_id': ['exact', 'in'],
    }
    search_fields = [
        'name',
        'description',
        'barcode',
        'case__name',
        'case__description',
        'case__creator__first_name',
        'case__creator__last_name',
        'case__investigator__first_name',
        'case__investigator__last_name',
    ]
    ordering_fields = ['created', 'updated', 'name', 'status']
    ordering = ['-created']

    def get_queryset(self):
        user = self.request.user
        search_query = self.request.query_params.get("search", "").strip()
        department_id = self.request.query_params.get("case__department")
        case_id = self.request.query_params.get("case_id")
        barcode = self.request.query_params.get("barcode")

        base_q_filter = Q()

        if barcode:
            base_q_filter &= Q(barcode=barcode)

        if user.role == "REGION_HEAD":
            base_q_filter &= Q(case__department__region=user.region)
        elif user.role == "DEPARTMENT_HEAD":
            base_q_filter &= Q(case__department=user.department)
        else:
            base_q_filter &= (Q(case__creator=user) | Q(case__investigator=user))

        if department_id:
            base_q_filter &= Q(case__department_id=department_id)

            if user.role == "REGION_HEAD":
                try:
                    dept = Department.objects.get(id=department_id)
                    if dept.region != user.region:
                        raise PermissionDenied("Вы не можете просматривать данные этого отделения.")
                except Department.DoesNotExist:
                    raise ValidationError({"detail": "Указанное отделение не найдено."})
            elif user.role == "DEPARTMENT_HEAD":
                if int(department_id) != user.department.id:
                    raise PermissionDenied("Вы не можете просматривать данные другого отделения.")

        if case_id:
            base_q_filter &= Q(case_id=case_id)

        if search_query:
            q_objects = Q()
            if search_query.isdigit() and len(search_query) == 13:
                q_objects |= Q(barcode=search_query) | Q(group__barcode=search_query)
            else:
                q_objects |= Q(
                    Q(name__icontains=search_query) |
                    Q(description__icontains=search_query) |
                    Q(case__name__icontains=search_query) |
                    Q(case__description__icontains=search_query) |
                    Q(case__creator__first_name__icontains=search_query) |
                    Q(case__creator__last_name__icontains=search_query) |
                    Q(case__investigator__first_name__icontains=search_query) |
                    Q(case__investigator__last_name__icontains=search_query)
                )
            base_q_filter &= q_objects

        queryset = MaterialEvidence.objects.filter(base_q_filter).distinct()
        queryset = queryset.select_related("case", "case__department", "created_by", "group")
        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        case = serializer.validated_data["case"]

        if user.role == "REGION_HEAD":
            if case.department.region != user.region:
                raise PermissionDenied("Вы не можете добавлять ВД к этому делу.")
        elif user.role == "DEPARTMENT_HEAD":
            if case.department != user.department:
                raise PermissionDenied("Вы не можете добавлять ВД к этому делу.")
        else:
            if case.creator != user and case.investigator != user:
                raise PermissionDenied("Вы не являетесь создателем или следователем этого дела.")

        serializer.save(created_by=user)

    def update(self, request, *args, **kwargs):
        user = request.user
        instance = self.get_object()
        case = instance.case

        if user.role == "REGION_HEAD":
            if case.department.region != user.region:
                raise PermissionDenied("Вы не можете изменять ВД в этом деле.")
        elif user.role == "DEPARTMENT_HEAD":
            if case.department != user.department:
                raise PermissionDenied("Вы не можете изменять ВД в этом деле.")
        else:
            if case.creator != user and case.investigator != user:
                raise PermissionDenied("Вы не можете изменять ВД в этом деле.")

        allowed_fields = {"status", "name", "description"}
        if not set(request.data.keys()).issubset(allowed_fields):
            raise PermissionDenied(
                f"Вы можете изменять только поля: {', '.join(allowed_fields)}."
            )

        partial = kwargs.pop("partial", False)
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def partial_update(self, request, *args, **kwargs):
        kwargs["partial"] = True
        return self.update(request, *args, **kwargs)


class MaterialEvidenceEventViewSet(viewsets.ModelViewSet):
    queryset = MaterialEvidenceEvent.objects.all()
    serializer_class = MaterialEvidenceEventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "REGION_HEAD":
            me_ids = MaterialEvidence.objects.filter(
                case__department__region=user.region
            ).values_list("id", flat=True)
            return MaterialEvidenceEvent.objects.filter(
                material_evidence_id__in=me_ids
            ).select_related("material_evidence", "user")
        elif user.role == "DEPARTMENT_HEAD":
            me_ids = MaterialEvidence.objects.filter(
                case__department=user.department
            ).values_list("id", flat=True)
            return MaterialEvidenceEvent.objects.filter(
                material_evidence_id__in=me_ids
            ).select_related("material_evidence", "user")
        else:
            me_ids = MaterialEvidence.objects.filter(
                Q(case__creator=user) | Q(case__investigator=user)
            ).values_list("id", flat=True)
            return MaterialEvidenceEvent.objects.filter(
                material_evidence_id__in=me_ids
            ).select_related("material_evidence", "user")

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(user=user)


class EvidenceGroupViewSet(viewsets.ModelViewSet):
    queryset = EvidenceGroup.objects.all()
    serializer_class = EvidenceGroupSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = {
        'barcode': ['exact'],
        'case': ['exact'],
    }
    search_fields = ['name']

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        barcode = self.request.query_params.get("barcode")
        if barcode:
            queryset = queryset.filter(barcode=barcode)

        case_id = self.request.query_params.get("case")
        if case_id:
            queryset = queryset.filter(case_id=case_id)

        if user.role == "REGION_HEAD":
            queryset = queryset.filter(case__department__region=user.region)
        elif user.role == "DEPARTMENT_HEAD":
            queryset = queryset.filter(case__department=user.department)
        else:
            queryset = queryset.filter(
                Q(case__creator=user) | Q(case__investigator=user)
            )

        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        case = serializer.validated_data.get("case")

        if case.creator != user and case.investigator != user:
            raise PermissionDenied(
                "Вы не являетесь создателем или следователем этого дела и не можете добавлять группы."
            )
        serializer.save(created_by=user)


class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]
    pagination_class = StandardResultsSetPagination

    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = {
        'login': ['gte', 'lte'],
        'logout': ['gte', 'lte'],
        'active': ['exact'],
        'user__department': ['exact'],
        'user__region': ['exact'],
        'user__role': ['exact'],
    }
    search_fields = [
        'user__username',
        'user__first_name',
        'user__last_name',
        'user__email',
        'user__phone_number',
        'user__rank',
        'user__department__name',
        'user__region',
        'user__role',
    ]
    ordering_fields = ['login', 'logout', 'user__username', 'user__first_name', 'user__last_name']
    ordering = ['-login']

    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset.select_related('user', 'user__department')

        user_id = self.request.query_params.get('user_id')
        department_id = self.request.query_params.get('user__department')
        region = self.request.query_params.get('user__region')

        base_q_filter = Q()

        if user.role == "REGION_HEAD":
            base_q_filter &= Q(user__region=user.region)

            if region and region != user.region:
                raise PermissionDenied("Вы не можете просматривать данные другого региона.")

            if department_id:
                try:
                    dept = Department.objects.get(id=department_id)
                    if dept.region != user.region:
                        raise PermissionDenied("Вы не можете просматривать данные этого отделения.")
                except Department.DoesNotExist:
                    raise ValidationError({"detail": "Указанное отделение не найдено."})
                base_q_filter &= Q(user__department_id=department_id)

            if user_id:
                try:
                    selected_user = User.objects.get(id=user_id)
                    if selected_user.region != user.region:
                        raise PermissionDenied("Вы не можете просматривать данные этого пользователя.")
                except User.DoesNotExist:
                    raise ValidationError({"detail": "Указанный пользователь не найден."})
                base_q_filter &= Q(user_id=user_id)

        elif user.role == "DEPARTMENT_HEAD":
            base_q_filter &= Q(user__department=user.department)

            if department_id and int(department_id) != user.department.id:
                raise PermissionDenied("Вы не можете просматривать данные другого отделения.")

            if user_id:
                try:
                    selected_user = User.objects.get(id=user_id)
                    if selected_user.department != user.department:
                        raise PermissionDenied("Вы не можете просматривать данные этого пользователя.")
                except User.DoesNotExist:
                    raise ValidationError({"detail": "Указанный пользователь не найден."})
                base_q_filter &= Q(user_id=user_id)

        else:
            base_q_filter &= Q(user=user)

        queryset = queryset.filter(base_q_filter)
        return queryset


import logging
logger = logging.getLogger(__name__)

from .janus_utils import increment_viewer, decrement_viewer


class CameraViewSet(viewsets.ModelViewSet):
    queryset = Camera.objects.all()
    serializer_class = CameraSerializer
    permission_classes = [IsAuthenticated, IsRegionHead]

    def get_queryset(self):
        user = self.request.user
        if user.role == "REGION_HEAD":
            return self.queryset.filter(region=user.region)
        elif user.role == "DEPARTMENT_HEAD":
            return self.queryset.filter(department=user.department)
        else:
            return self.queryset.none()

    @action(detail=True, methods=['post'], url_path='start_watching')
    def start_watching(self, request, pk=None):
        """
        Увеличивает счётчик зрителей (increment_viewer);
        если стрим не запущен, start_camera_stream().
        Возвращает mountpoint_id, чтобы фронт мог подключиться.
        """
        camera = self.get_object()
        increment_viewer(camera)
        return Response(
            {"mountpoint_id": camera.mountpoint_id},
            status=status.HTTP_200_OK
        )

    @action(detail=True, methods=['post'], url_path='stop_watching')
    def stop_watching(self, request, pk=None):
        """
        Уменьшает счётчик зрителей (decrement_viewer);
        если счётчик стал 0, stop_camera_stream().
        """
        camera = self.get_object()
        decrement_viewer(camera)
        return Response({"message": "ok"}, status=status.HTTP_200_OK)


class AuditEntryViewSet(viewsets.ModelViewSet):
    queryset = AuditEntry.objects.all()
    serializer_class = AuditEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset

        case_id = self.request.query_params.get('case_id')
        if case_id:
            queryset = queryset.filter(case_id=case_id)
        else:
            raise PermissionDenied("Требуется указать 'case_id' для доступа к записям аудита.")

        try:
            case = Case.objects.get(id=case_id)
        except Case.DoesNotExist:
            raise PermissionDenied("Дело не найдено.")

        queryset = queryset.order_by('created')

        if user.role == "REGION_HEAD":
            if case.department.region != user.region:
                raise PermissionDenied("У вас нет прав для доступа к истории изменений этого дела.")
            return queryset.select_related("user")
        elif user.role == "DEPARTMENT_HEAD":
            if case.department != user.department:
                raise PermissionDenied("У вас нет прав для доступа к истории изменений этого дела.")
            return queryset.select_related("user")
        else:
            if case.creator == user or case.investigator == user:
                return queryset.select_related("user")
            else:
                raise PermissionDenied("У вас нет прав для доступа к истории изменений этого дела.")


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser, JSONParser)

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        if user.role == "REGION_HEAD":
            queryset = queryset.filter(
                Q(case__department__region=user.region) |
                Q(material_evidence__case__department__region=user.region)
            )
        elif user.role == "DEPARTMENT_HEAD":
            queryset = queryset.filter(
                Q(case__department=user.department) |
                Q(material_evidence__case__department=user.department)
            )
        else:
            queryset = queryset.filter(
                Q(case__creator=user) |
                Q(case__investigator=user) |
                Q(material_evidence__case__creator=user) |
                Q(material_evidence__case__investigator=user)
            )

        case_id = self.request.query_params.get('case_id')
        material_evidence_id = self.request.query_params.get('material_evidence_id')

        if case_id:
            queryset = queryset.filter(case_id=case_id)
        if material_evidence_id:
            queryset = queryset.filter(material_evidence_id=material_evidence_id)

        return queryset

    def perform_create(self, serializer):
        user = self.request.user
        case = serializer.validated_data.get('case', None)
        material_evidence = serializer.validated_data.get('material_evidence', None)

        if not case and not material_evidence:
            raise ValidationError("Документ должен быть связан либо с делом, либо с вещественным доказательством.")

        if case:
            if user.role == "REGION_HEAD":
                if case.department.region != user.region:
                    raise PermissionDenied("Вы не можете добавлять документы к этому делу.")
            elif user.role == "DEPARTMENT_HEAD":
                if case.department != user.department:
                    raise PermissionDenied("Вы не можете добавлять документы к этому делу.")
            else:
                if case.creator != user and case.investigator != user:
                    raise PermissionDenied("Вы не можете добавлять документы к этому делу.")
        elif material_evidence:
            case = material_evidence.case
            if user.role == "REGION_HEAD":
                if case.department.region != user.region:
                    raise PermissionDenied("Вы не можете добавлять документы к этому вещественному доказательству.")
            elif user.role == "DEPARTMENT_HEAD":
                if case.department != user.department:
                    raise PermissionDenied("Вы не можете добавлять документы к этому вещественному доказательству.")
            else:
                if case.creator != user and case.investigator != user:
                    raise PermissionDenied("Вы не можете добавлять документы к этому вещественному доказательству.")

        document = serializer.save(uploaded_by=user)

        from .models import AuditEntry
        AuditEntry.objects.create(
            object_id=document.id,
            object_name=document.description or document.file.name,
            table_name='document',
            class_name='Document',
            action='create',
            fields='file, description',
            data=json.dumps({
                'file': document.file.name,
                'description': document.description,
                'uploaded_by': user.get_full_name(),
                'uploaded_at': document.uploaded_at.strftime('%Y-%m-%d %H:%M:%S'),
                'case_id': case.id if case else None,
                'material_evidence_id': material_evidence.id if material_evidence else None
            }, ensure_ascii=False),
            user=user,
            case=case
        )

    def perform_destroy(self, instance):
        user = self.request.user
        case = instance.case or instance.material_evidence.case

        if user.role == "REGION_HEAD":
            if case.department.region != user.region:
                raise PermissionDenied("Вы не можете удалять документы в этом деле.")
        elif user.role == "DEPARTMENT_HEAD":
            if case.department != user.department:
                raise PermissionDenied("Вы не можете удалять документы в этом деле.")
        else:
            if case.creator != user and case.investigator != user:
                raise PermissionDenied("Вы не можете удалять документы в этом деле.")

        document_data = {
            'file': instance.file.name,
            'description': instance.description,
            'uploaded_by': instance.uploaded_by.get_full_name(),
            'uploaded_at': instance.uploaded_at.strftime('%Y-%m-%d %H:%M:%S'),
            'case_id': instance.case.id if instance.case else None,
            'material_evidence_id': instance.material_evidence.id if instance.material_evidence else None
        }

        if instance.file:
            instance.file.delete(save=False)

        super().perform_destroy(instance)

        from .models import AuditEntry
        AuditEntry.objects.create(
            object_id=instance.id,
            object_name=instance.description or instance.file.name,
            table_name='document',
            class_name='Document',
            action='delete',
            fields='file, description',
            data=json.dumps(document_data, ensure_ascii=False),
            user=user,
            case=case
        )

    def update(self, request, *args, **kwargs):
        user = self.request.user
        instance = self.get_object()

        case = instance.case or instance.material_evidence.case

        if user.role == "REGION_HEAD":
            if case.department.region != user.region:
                raise PermissionDenied("Вы не можете изменять документы в этом деле.")
        elif user.role == "DEPARTMENT_HEAD":
            if case.department != user.department:
                raise PermissionDenied("Вы не можете изменять документы в этом деле.")
        else:
            if case.creator != user and case.investigator != user:
                raise PermissionDenied("Вы не можете изменять документы в этом деле.")

        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)


# ---------------------------
# CameraViewingSessionViewSet (Подход B)
# ---------------------------
class CameraViewingSessionViewSet(viewsets.ModelViewSet):
    """
    Управление записями о просмотре камеры пользователем:
     - Создание сессии (без increment_viewer)
     - keepalive (ping)
     - Удаление сессии (без decrement_viewer)
    Вся логика инкремента/декремента находится в CameraViewSet.
    """
    queryset = CameraViewingSession.objects.all()
    serializer_class = CameraViewingSessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        qs = super().get_queryset().select_related('session', 'session__user', 'camera')
        if user.role == "REGION_HEAD":
            return qs.filter(camera__region=user.region)
        elif user.role == "DEPARTMENT_HEAD":
            return qs.filter(camera__department=user.department)
        else:
            return qs.filter(session__user=user)

    @action(detail=True, methods=['post'], url_path='ping')
    def ping_viewing(self, request, pk=None):
        """
        Частичное обновление last_ping.
        """
        cvs = self.get_object()
        if self.request.user.role not in ['REGION_HEAD', 'DEPARTMENT_HEAD']:
            # Обычный пользователь может пинговать только свою сессию
            if cvs.session.user != self.request.user:
                raise PermissionDenied("Нельзя обновлять чужую сессию.")
        cvs.last_ping = timezone.now()
        cvs.save(update_fields=['last_ping'])
        return Response({"detail": "last_ping updated"}, status=200)


# ---------------------------
# Authentication and CSRF Views
# ---------------------------

@ensure_csrf_cookie
@api_view(["GET"])
@permission_classes([AllowAny])
def get_csrf_token(request):
    return JsonResponse({"detail": "CSRF cookie set"})


@api_view(["POST"])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get("username")
    password = request.data.get("password")
    user = authenticate(request, username=username, password=password)
    if user is not None:
        if not user.is_active:
            return JsonResponse({"detail": "Ваш аккаунт деактивирован. Обратитесь к администратору."}, status=403)

        request.session['temp_user_id'] = user.id

        if 'archive' in username:
            login(request, user)
            return JsonResponse({"detail": "Успешный вход в систему", "login_successful": True})

        if user.biometric_registered:
            return JsonResponse({"detail": "Требуется биометрическая аутентификация", "biometric_required": True})
        else:
            return JsonResponse({"detail": "Требуется регистрация биометрии", "biometric_registration_required": True})
    else:
        return JsonResponse({"detail": "Неверные учетные данные"}, status=401)


@api_view(["POST"])
def logout_view(request):
    user = request.user
    if user.is_authenticated:
        Session.objects.filter(user=user, active=True).update(logout=timezone.now(), active=False)
        logout(request)
        return JsonResponse({"detail": "Вы успешно вышли из системы"})
    else:
        return JsonResponse({"detail": "Пользователь не аутентифицирован"}, status=400)


@api_view(["GET"])
def check_auth(request):
    if request.user.is_authenticated:
        return JsonResponse({"is_authenticated": True})
    else:
        return JsonResponse({"is_authenticated": False}, status=401)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def download_certificate(request):
    file_path = settings.CERTIFICATE_FILE_PATH
    if os.path.exists(file_path):
        response = FileResponse(open(file_path, 'rb'), content_type='application/x-x509-ca-cert')
        response['Content-Disposition'] = 'attachment; filename="certificate.crt"'
        return response
    else:
        return Response({'detail': 'Файл не найден.'}, status=404)
