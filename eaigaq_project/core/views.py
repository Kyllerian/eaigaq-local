# eaigaq_project/core/views.py

from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse, FileResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.db.models import Q
from django.forms.models import model_to_dict
import os
from django.conf import settings

from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework.parsers import MultiPartParser, FormParser  # Добавлено для обработки файлов

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
)


# ---------------------------
# ViewSets for models
# ---------------------------

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user

        if user.role == "REGION_HEAD":
            # Главный по региону видит всех сотрудников своего региона
            return self.queryset.filter(region=user.region)
        elif user.role == "DEPARTMENT_HEAD":
            # Главный по отделению видит всех сотрудников своего отделения
            return self.queryset.filter(department=user.department)
        else:
            # Обычные пользователи видят только себя
            return self.queryset.filter(id=user.id)

    def perform_create(self, serializer):
        user = self.request.user

        if user.role == "REGION_HEAD":
            # REGION_HEAD может создавать пользователей в своем регионе
            new_user_region = serializer.validated_data.get("region")
            department = serializer.validated_data.get("department")

            # Если указан отделение, проверяем, что оно принадлежит региону пользователя
            if department and department.region != user.region:
                raise PermissionDenied(
                    "Вы не можете назначить пользователя в отделение другого региона."
                )

            # Если регион не указан, устанавливаем регион пользователя
            if not new_user_region:
                serializer.validated_data["region"] = user.region
            else:
                # Проверяем, что указанный регион совпадает с регионом пользователя
                if new_user_region != user.region:
                    raise PermissionDenied(
                        "Вы не можете создавать пользователей в другом регионе."
                    )

            serializer.save()
        elif user.role == "DEPARTMENT_HEAD":
            department = user.department
            serializer.validated_data["department"] = department
            serializer.validated_data[
                "role"] = "USER"  # DEPARTMENT_HEAD может создавать только пользователей с ролью USER

            # Регион будет установлен автоматически в модели User
            serializer.validated_data.pop("region", None)

            serializer.save()
        else:
            raise PermissionDenied("У вас нет прав для создания пользователей.")

    def update(self, request, *args, **kwargs):
        user = request.user
        instance = self.get_object()

        # Проверяем права на изменение is_active
        if "is_active" in request.data:
            if user.role == "REGION_HEAD":
                # REGION_HEAD может изменять is_active для сотрудников своего региона
                if instance.region != user.region:
                    raise PermissionDenied(
                        "Вы не можете изменять статус этого пользователя."
                    )
            elif user.role == "DEPARTMENT_HEAD":
                # DEPARTMENT_HEAD может изменять is_active для сотрудников своего отделения
                if instance.department != user.department:
                    raise PermissionDenied(
                        "Вы не можете изменять статус этого пользователя."
                    )
            else:
                raise PermissionDenied(
                    "У вас нет прав для изменения этого пользователя."
                )

        # Проверяем, что DEPARTMENT_HEAD не может менять роль пользователя
        if "role" in request.data and user.role == "DEPARTMENT_HEAD":
            if request.data["role"] != "USER":
                raise PermissionDenied(
                    "Вы не можете изменять роль пользователя."
                )

        return super().update(request, *args, **kwargs)

    @action(detail=False, methods=["get"])
    def all_departments(self, request):
        # Для REGION_HEAD возвращаем всех сотрудников региона
        user = self.request.user
        if user.role == "REGION_HEAD":
            users = self.queryset.filter(region=user.region)
            serializer = self.get_serializer(users, many=True)
            return Response(serializer.data)
        else:
            raise PermissionDenied("У вас нет прав для доступа к этому ресурсу.")


class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

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
            # Видит все отделения в своем регионе
            return Department.objects.filter(region=user.region)
        else:
            # Обычные пользователи не имеют доступа
            self.permission_denied(
                self.request, message="Недостаточно прав для доступа к отделениям"
            )

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == "REGION_HEAD":
            # Может создавать отделения в своем регионе
            serializer.save(region=user.region)
        else:
            self.permission_denied(
                self.request, message="Недостаточно прав для создания отделения"
            )


class CaseViewSet(viewsets.ModelViewSet):
    queryset = Case.objects.all()
    serializer_class = CaseSerializer
    permission_classes = [IsAuthenticated]

    # Добавляем фильтры
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['department']  # Фильтрация по отделению
    search_fields = ['name', 'creator__username']  # Поиск по названию дела и имени создателя

    def get_permissions(self):
        if self.action in ["update", "partial_update", "destroy"]:
            permission_classes = [IsAuthenticated]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user

        # Получаем параметры поиска и фильтрации
        search_query = self.request.query_params.get("search", "").strip()
        department_id = self.request.query_params.get("department")

        # Инициализируем базовый фильтр
        base_q_filter = Q()

        if department_id:
            base_q_filter &= Q(department_id=department_id)

        # Инициализируем объект Q для поиска
        q_objects = Q()

        # Инициализируем переменные для хранения case_ids
        case_ids_from_evidences = []
        case_ids_from_groups = []

        if search_query:
            # Проверяем, является ли поисковый запрос штрихкодом
            if search_query.isdigit() and len(search_query) == 13:
                # Ищем вещественные доказательства с данным штрихкодом
                material_evidences = MaterialEvidence.objects.filter(
                    barcode=search_query
                )

                # Получаем ID дел, связанных с найденными вещественными доказательствами
                case_ids_from_evidences = material_evidences.values_list(
                    "case_id", flat=True
                )

                # Если есть совпадения, добавляем их в фильтр
                if case_ids_from_evidences:
                    q_objects |= Q(id__in=case_ids_from_evidences)

                # Ищем группы вещественных доказательств с данным штрихкодом
                evidence_groups = EvidenceGroup.objects.filter(barcode=search_query)
                case_ids_from_groups = evidence_groups.values_list(
                    "case_id", flat=True
                )

                if case_ids_from_groups:
                    q_objects |= Q(id__in=case_ids_from_groups)
            else:
                # Поиск по названию дела и имени создателя
                q_objects |= Q(name__icontains=search_query) | Q(
                    creator__username__icontains=search_query
                )

        # Применяем фильтр доступа на основе роли пользователя
        if user.role == "REGION_HEAD":
            base_q_filter &= Q(department__region=user.region)
        elif user.role == "DEPARTMENT_HEAD":
            base_q_filter &= Q(department=user.department)
        else:
            # Обычный пользователь может видеть дела, где он является создателем или следователем
            base_q_filter &= Q(creator=user) | Q(investigator=user)

            if search_query and (case_ids_from_evidences or case_ids_from_groups):
                case_ids = set(case_ids_from_evidences) | set(case_ids_from_groups)
                base_q_filter |= Q(id__in=case_ids)

        # Применяем фильтры к queryset
        queryset = Case.objects.filter(base_q_filter & q_objects).distinct()

        return queryset.select_related("creator", "investigator", "department")

    def update(self, request, *args, **kwargs):
        user = request.user
        instance = self.get_object()
        old_instance = model_to_dict(instance)

        # Получаем данные из запроса
        data = request.data
        updated_fields = set(data.keys())

        # Удаляем поля, которые не должны учитываться при проверке
        ignored_fields = {'department_id', 'department'}
        updated_fields -= ignored_fields

        # Проверка прав доступа и валидация изменений
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

        # Проверяем права на изменение других полей
        allowed_fields = {'name', 'description', 'active', 'investigator', 'creator'}
        if user.role not in ['REGION_HEAD', 'DEPARTMENT_HEAD']:
            # Обычные пользователи
            if instance.investigator != user:
                raise PermissionDenied("Вы не являетесь следователем этого дела.")
            disallowed_fields = updated_fields - allowed_fields
            if disallowed_fields:
                raise PermissionDenied(f"Вы не можете обновлять поля: {', '.join(disallowed_fields)}")
        else:
            # REGION_HEAD и DEPARTMENT_HEAD могут менять разрешенные поля
            disallowed_fields = updated_fields - allowed_fields
            if disallowed_fields:
                raise PermissionDenied(f"Вы не можете обновлять поля: {', '.join(disallowed_fields)}")

        # Вызываем оригинальный метод update с обновленными данными
        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Получаем обновленный экземпляр
        new_instance = self.get_object()
        new_instance_dict = model_to_dict(new_instance)

        # Определяем, какие поля были изменены
        changes = {}
        for field in new_instance_dict.keys():
            old_value = old_instance.get(field)
            new_value = new_instance_dict.get(field)
            if old_value != new_value:
                if field in ['investigator', 'creator']:
                    old_user = User.objects.get(id=old_value) if old_value else None
                    new_user = User.objects.get(id=new_value) if new_value else None
                    old_value_display = f"{old_user.get_full_name()} - ({old_user.rank})" if old_user else None
                    new_value_display = f"{new_user.get_full_name()} - ({new_user.rank})" if new_user else None
                    changes[field] = {'old': old_value_display, 'new': new_value_display}
                else:
                    changes[field] = {'old': old_value, 'new': new_value}

        if changes:
            # Создаем запись в AuditEntry
            AuditEntry.objects.create(
                object_id=instance.id,
                object_name=instance.name,
                table_name='case',
                class_name='Case',
                action='update',
                fields=', '.join(changes.keys()),
                data=json.dumps(changes, ensure_ascii=False, default=str),
                user=user,
                case=instance  # Ссылка на дело
            )

        return Response(serializer.data)

    def perform_create(self, serializer):
        user = self.request.user
        if not user.department:
            raise PermissionDenied("У вас нет назначенного отделения для создания дела.")
        serializer.save(
            creator=user, investigator=user, department=user.department
        )

    @action(detail=False, methods=["get"])
    def get_by_barcode(self, request):
        barcode = request.query_params.get("barcode")
        if not barcode:
            return Response({"detail": "Требуется штрихкод."}, status=400)

        user = request.user

        # Ищем вещественное доказательство или группу по штрихкоду
        material_evidence = MaterialEvidence.objects.filter(barcode=barcode).first()
        evidence_group = EvidenceGroup.objects.filter(barcode=barcode).first()

        # Определяем дело
        case = None
        if material_evidence:
            case = material_evidence.case
        elif evidence_group:
            case = evidence_group.case

        if not case:
            return Response({"detail": "Дело не найдено."}, status=404)

        # Проверяем права доступа
        if user.role == "REGION_HEAD" and case.department.region != user.region:
            raise PermissionDenied("У вас нет прав для доступа к этому делу.")
        elif user.role == "DEPARTMENT_HEAD" and case.department != user.department:
            raise PermissionDenied("У вас нет прав для доступа к этому делу.")
        elif (
                user.role == "USER"
                and case.creator != user
                and case.investigator != user
        ):
            raise PermissionDenied("У вас нет прав для доступа к этому делу.")

        # Возвращаем данные дела
        serializer = self.get_serializer(case)
        return Response(serializer.data)


class MaterialEvidenceViewSet(viewsets.ModelViewSet):
    queryset = MaterialEvidence.objects.all()
    serializer_class = MaterialEvidenceSerializer
    permission_classes = [IsAuthenticated]

    # Добавляем фильтры
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = {
        'type': ['exact'],  # Фильтрация по типу ВД
        'created': ['gte', 'lte'],  # Фильтрация по дате создания
    }
    search_fields = ['name', 'description']  # Поиск по названию и описанию

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        # Фильтрация по ID дела, если указан параметр 'case'
        case_id = self.request.query_params.get("case")
        if case_id:
            queryset = queryset.filter(case_id=case_id)

        # Фильтрация на основе роли пользователя
        if user.role == "REGION_HEAD":
            queryset = queryset.filter(case__department__region=user.region)
        elif user.role == "DEPARTMENT_HEAD":
            queryset = queryset.filter(case__department=user.department)
        else:
            # Пользователь видит вещественные доказательства дел, где он является создателем или следователем
            queryset = queryset.filter(
                Q(case__creator=user) | Q(case__investigator=user)
            )

        return queryset.select_related("case", "created_by")

    def perform_create(self, serializer):
        user = self.request.user
        case = serializer.validated_data["case"]
        if case.creator != user and case.investigator != user:
            self.permission_denied(
                self.request, message="Вы не являетесь создателем или следователем этого дела."
            )
        serializer.save(created_by=user)
        # Логирование создания вещественного доказательства происходит в модели

    def update(self, request, *args, **kwargs):
        user = request.user
        instance = self.get_object()
        case = instance.case

        # Проверяем, является ли пользователь создателем или следователем дела
        if case.creator != user and case.investigator != user:
            raise PermissionDenied(
                "Вы не являетесь создателем или следователем этого дела и не можете изменять вещественные доказательства."
            )

        # Проверяем, что обновляется только разрешенные поля
        allowed_fields = {"status", "name", "description"}
        if not set(request.data.keys()).issubset(allowed_fields):
            raise PermissionDenied(
                f"Вы можете изменять только поля: {', '.join(allowed_fields)}."
            )

        # Проверяем, является ли запрос частичным обновлением
        partial = kwargs.pop("partial", False)

        old_instance = model_to_dict(instance)

        serializer = self.get_serializer(
            instance, data=request.data, partial=partial
        )
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        # Получаем обновленный экземпляр
        new_instance = self.get_object()
        new_instance_dict = model_to_dict(new_instance)

        # Определяем, какие поля были изменены
        changes = {}
        for field in new_instance_dict.keys():
            if field in allowed_fields:
                old_value = old_instance.get(field)
                new_value = new_instance_dict.get(field)
                if old_value != new_value:
                    changes[field] = {'old': old_value, 'new': new_value}

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
            # Видит все события ВД в своем регионе
            material_evidence_ids = MaterialEvidence.objects.filter(
                case__department__region=user.region
            ).values_list("id", flat=True)
            return MaterialEvidenceEvent.objects.filter(
                material_evidence_id__in=material_evidence_ids
            ).select_related("material_evidence", "user")
        elif user.role == "DEPARTMENT_HEAD":
            # Видит все события ВД в своем отделении
            material_evidence_ids = MaterialEvidence.objects.filter(
                case__department=user.department
            ).values_list("id", flat=True)
            return MaterialEvidenceEvent.objects.filter(
                material_evidence_id__in=material_evidence_ids
            ).select_related("material_evidence", "user")
        else:
            # Обычный пользователь видит только события ВД в делах, где он является создателем или следователем
            material_evidence_ids = MaterialEvidence.objects.filter(
                Q(case__creator=user) | Q(case__investigator=user)
            ).values_list("id", flat=True)
            return MaterialEvidenceEvent.objects.filter(
                material_evidence_id__in=material_evidence_ids
            ).select_related("material_evidence", "user")

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(user=user)
        # Логирование происходит в модели MaterialEvidenceEvent


class EvidenceGroupViewSet(viewsets.ModelViewSet):
    queryset = EvidenceGroup.objects.all()
    serializer_class = EvidenceGroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        case_id = self.request.query_params.get("case")
        queryset = self.queryset

        if case_id:
            queryset = queryset.filter(case_id=case_id)

        if user.role == "REGION_HEAD":
            return queryset.filter(case__department__region=user.region)
        elif user.role == "DEPARTMENT_HEAD":
            return queryset.filter(case__department=user.department)
        else:
            # Пользователь видит группы в делах, где он является создателем или следователем
            return queryset.filter(
                Q(case__creator=user) | Q(case__investigator=user)
            )

    def perform_create(self, serializer):
        user = self.request.user
        case = serializer.validated_data.get("case")

        # Проверяем, является ли пользователь создателем или следователем дела
        if case.creator != user and case.investigator != user:
            raise PermissionDenied(
                "Вы не являетесь создателем или следователем этого дела и не можете добавлять группы."
            )

        serializer.save(created_by=user)
        # Можно добавить логирование создания группы, если необходимо


class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]

    # Добавляем фильтры
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = {
        'login': ['gte', 'lte'],  # Фильтрация по дате входа
    }

    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset.select_related('user')

        # Получаем параметры фильтрации из запроса
        user_id = self.request.query_params.get('user_id')
        department_id = self.request.query_params.get('department_id')
        region = self.request.query_params.get('region')

        # Базовый фильтр на основе роли пользователя
        if user.role == "REGION_HEAD":
            queryset = queryset.filter(user__region=user.region)
            # Проверяем, что запрашиваемый регион соответствует региону пользователя
            if region and region != user.region:
                raise PermissionDenied("Вы не можете просматривать данные другого региона.")

            # Проверяем отделение
            if department_id:
                try:
                    department = Department.objects.get(id=department_id)
                except Department.DoesNotExist:
                    raise PermissionDenied("Отделение не найдено.")
                if department.region != user.region:
                    raise PermissionDenied("Вы не можете просматривать данные этого отделения.")
                queryset = queryset.filter(user__department_id=department_id)

            # Проверяем пользователя
            if user_id:
                try:
                    selected_user = User.objects.get(id=user_id)
                except User.DoesNotExist:
                    raise PermissionDenied("Пользователь не найден.")
                if selected_user.region != user.region:
                    raise PermissionDenied("Вы не можете просматривать данные этого пользователя.")
                queryset = queryset.filter(user_id=user_id)

        elif user.role == "DEPARTMENT_HEAD":
            queryset = queryset.filter(user__department=user.department)
            # Проверяем, что запрашиваемое отделение соответствует отделению пользователя
            if department_id and int(department_id) != user.department.id:
                raise PermissionDenied("Вы не можете просматривать данные другого отделения.")

            # Проверяем пользователя
            if user_id:
                try:
                    selected_user = User.objects.get(id=user_id)
                except User.DoesNotExist:
                    raise PermissionDenied("Пользователь не найден.")
                if selected_user.department != user.department:
                    raise PermissionDenied("Вы не можете просматривать данные этого пользователя.")
                queryset = queryset.filter(user_id=user_id)

        else:
            queryset = queryset.filter(user=user)
            # Обычные пользователи не могут применять фильтры

        return queryset


class CameraViewSet(viewsets.ModelViewSet):
    queryset = Camera.objects.all()
    serializer_class = CameraSerializer
    permission_classes = [IsAuthenticated, IsRegionHead]

    def get_queryset(self):
        user = self.request.user
        if user.role == "REGION_HEAD":
            return self.queryset
        else:
            self.permission_denied(
                self.request, message="Недостаточно прав для доступа к камерам"
            )


class AuditEntryViewSet(viewsets.ModelViewSet):
    queryset = AuditEntry.objects.all()
    serializer_class = AuditEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = self.queryset

        # Фильтрация по ID дела, если указан параметр 'case_id'
        case_id = self.request.query_params.get('case_id')
        if case_id:
            queryset = queryset.filter(case_id=case_id)
        else:
            # Если 'case_id' не указан, запрещаем доступ
            raise PermissionDenied("Требуется указать 'case_id' для доступа к записям аудита.")

        # Получаем дело по 'case_id'
        try:
            case = Case.objects.get(id=case_id)
        except Case.DoesNotExist:
            raise PermissionDenied("Дело не найдено.")

        # Сортировка по возрастанию даты создания
        queryset = queryset.order_by('created')

        # Проверка прав доступа на основе роли пользователя и принадлежности дела
        if user.role == "REGION_HEAD":
            # Главы регионов видят дела в своем регионе
            if case.department.region != user.region:
                raise PermissionDenied("У вас нет прав для доступа к истории изменений этого дела.")
            return queryset.select_related("user")
        elif user.role == "DEPARTMENT_HEAD":
            # Главы отделений видят дела в своем отделении
            if case.department != user.department:
                raise PermissionDenied("У вас нет прав для доступа к истории изменений этого дела.")
            return queryset.select_related("user")
        else:
            # Обычные пользователи могут видеть историю изменений своих дел
            if case.creator == user or case.investigator == user:
                return queryset.select_related("user")
            else:
                raise PermissionDenied("У вас нет прав для доступа к истории изменений этого дела.")


class DocumentViewSet(viewsets.ModelViewSet):
    queryset = Document.objects.all()
    serializer_class = DocumentSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)  # Необходимо для обработки загрузки файлов

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        # Фильтрация документов на основе роли пользователя
        if user.role == "REGION_HEAD":
            # Главный по региону видит документы в своём регионе
            queryset = queryset.filter(
                Q(case__department__region=user.region) |
                Q(material_evidence__case__department__region=user.region)
            )
        elif user.role == "DEPARTMENT_HEAD":
            # Главный по отделению видит документы в своём отделении
            queryset = queryset.filter(
                Q(case__department=user.department) |
                Q(material_evidence__case__department=user.department)
            )
        else:
            # Обычный пользователь видит документы, связанные с делами, где он является создателем или следователем
            queryset = queryset.filter(
                Q(case__creator=user) |
                Q(case__investigator=user) |
                Q(material_evidence__case__creator=user) |
                Q(material_evidence__case__investigator=user)
            )

        # Добавляем возможность фильтрации по 'case_id' или 'material_evidence_id'
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

        # Проверка прав доступа
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

        # Сохраняем документ
        document = serializer.save(uploaded_by=user)

        # 🆕 Создаем запись в AuditEntry
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

        # Проверка прав на удаление документа
        if user.role == "REGION_HEAD":
            if case.department.region != user.region:
                raise PermissionDenied("Вы не можете удалять документы в этом деле.")
        elif user.role == "DEPARTMENT_HEAD":
            if case.department != user.department:
                raise PermissionDenied("Вы не можете удалять документы в этом деле.")
        else:
            if case.creator != user and case.investigator != user:
                raise PermissionDenied("Вы не можете удалять документы в этом деле.")

        # Получаем данные для AuditEntry перед удалением
        document_data = {
            'file': instance.file.name,
            'description': instance.description,
            'uploaded_by': instance.uploaded_by.get_full_name(),
            'uploaded_at': instance.uploaded_at.strftime('%Y-%m-%d %H:%M:%S'),
            'case_id': instance.case.id if instance.case else None,
            'material_evidence_id': instance.material_evidence.id if instance.material_evidence else None
        }

        # Удаляем файл с диска при удалении объекта
        if instance.file:
            instance.file.delete(save=False)

        # Удаляем документ
        super().perform_destroy(instance)

        # 🆕 Создаем запись в AuditEntry
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

# class DocumentViewSet(viewsets.ModelViewSet):
#     queryset = Document.objects.all()
#     serializer_class = DocumentSerializer
#     permission_classes = [IsAuthenticated]
#     parser_classes = (MultiPartParser, FormParser)  # Необходимо для обработки загрузки файлов
#
#     def get_queryset(self):
#         user = self.request.user
#         queryset = super().get_queryset()
#
#         # Фильтрация документов на основе роли пользователя
#         if user.role == "REGION_HEAD":
#             # Главный по региону видит документы в своём регионе
#             queryset = queryset.filter(
#                 Q(case__department__region=user.region) |
#                 Q(material_evidence__case__department__region=user.region)
#             )
#         elif user.role == "DEPARTMENT_HEAD":
#             # Главный по отделению видит документы в своём отделении
#             queryset = queryset.filter(
#                 Q(case__department=user.department) |
#                 Q(material_evidence__case__department=user.department)
#             )
#         else:
#             # Обычный пользователь видит документы, связанные с делами, где он является создателем или следователем
#             queryset = queryset.filter(
#                 Q(case__creator=user) |
#                 Q(case__investigator=user) |
#                 Q(material_evidence__case__creator=user) |
#                 Q(material_evidence__case__investigator=user)
#             )
#
#         # Добавляем возможность фильтрации по 'case_id' или 'material_evidence_id'
#         case_id = self.request.query_params.get('case_id')
#         material_evidence_id = self.request.query_params.get('material_evidence_id')
#
#         if case_id:
#             queryset = queryset.filter(case_id=case_id)
#         if material_evidence_id:
#             queryset = queryset.filter(material_evidence_id=material_evidence_id)
#
#         return queryset
#
#     def perform_create(self, serializer):
#         user = self.request.user
#         case = serializer.validated_data.get('case', None)
#         material_evidence = serializer.validated_data.get('material_evidence', None)
#
#         if not case and not material_evidence:
#             raise ValidationError("Документ должен быть связан либо с делом, либо с вещественным доказательством.")
#
#         # Проверка прав доступа
#         if case:
#             if user.role == "REGION_HEAD":
#                 if case.department.region != user.region:
#                     raise PermissionDenied("Вы не можете добавлять документы к этому делу.")
#             elif user.role == "DEPARTMENT_HEAD":
#                 if case.department != user.department:
#                     raise PermissionDenied("Вы не можете добавлять документы к этому делу.")
#             else:
#                 if case.creator != user and case.investigator != user:
#                     raise PermissionDenied("Вы не можете добавлять документы к этому делу.")
#         elif material_evidence:
#             case = material_evidence.case
#             if user.role == "REGION_HEAD":
#                 if case.department.region != user.region:
#                     raise PermissionDenied("Вы не можете добавлять документы к этому вещественному доказательству.")
#             elif user.role == "DEPARTMENT_HEAD":
#                 if case.department != user.department:
#                     raise PermissionDenied("Вы не можете добавлять документы к этому вещественному доказательству.")
#             else:
#                 if case.creator != user and case.investigator != user:
#                     raise PermissionDenied("Вы не можете добавлять документы к этому вещественному доказательству.")
#
#         serializer.save(uploaded_by=user)
#
#     def perform_destroy(self, instance):
#         user = self.request.user
#         case = instance.case or instance.material_evidence.case
#
#         # Проверка прав на удаление документа
#         if user.role == "REGION_HEAD":
#             if case.department.region != user.region:
#                 raise PermissionDenied("Вы не можете удалять документы в этом деле.")
#         elif user.role == "DEPARTMENT_HEAD":
#             if case.department != user.department:
#                 raise PermissionDenied("Вы не можете удалять документы в этом деле.")
#         else:
#             if case.creator != user and case.investigator != user:
#                 raise PermissionDenied("Вы не можете удалять документы в этом деле.")
#
#         # Удаляем файл с диска при удалении объекта
#         if instance.file:
#             instance.file.delete(save=False)
#         super().perform_destroy(instance)


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
    # logger.info(f"Попытка входа: {username}")
    user = authenticate(request, username=username, password=password)
    if user is not None:
        # logger.info(f"Успешная аутентификация для пользователя: {user.username}")
        request.session['temp_user_id'] = user.id

        if 'archive' in username:
            # Прямо логиним пользователя без биометрической аутентификации
            login(request, user)
            return JsonResponse({"detail": "Успешный вход в систему", "login_successful": True})

        if user.biometric_registered:
            # Требуется биометрическая аутентификация через WebSocket
            return JsonResponse({"detail": "Требуется биометрическая аутентификация", "biometric_required": True})
        else:
            # Требуется регистрация биометрии через WebSocket
            return JsonResponse({"detail": "Требуется регистрация биометрии", "biometric_registration_required": True})
    else:
        # logger.warning(f"Аутентификация не удалась для пользователя: {username}")
        return JsonResponse({"detail": "Неверные учетные данные"}, status=401)


@api_view(["POST"])
def logout_view(request):
    user = request.user
    if user.is_authenticated:
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

# # eaigaq_project/core/views.py
#
# from django.contrib.auth import authenticate, login, logout
# from django.http import JsonResponse, FileResponse
# from django.views.decorators.csrf import ensure_csrf_cookie
# from django.db.models import Q
# from django.forms.models import model_to_dict
# from django.contrib.auth import login
# import os
# from django.conf import settings
#
# from rest_framework import viewsets, filters
# from django_filters.rest_framework import DjangoFilterBackend
#
# import json
#
# from rest_framework.exceptions import PermissionDenied, ValidationError
# from rest_framework import viewsets, permissions, status
# from rest_framework.decorators import (
#     api_view,
#     permission_classes,
#     action,
# )
# from rest_framework.permissions import AllowAny, IsAuthenticated
# from rest_framework.response import Response
# from rest_framework.filters import SearchFilter
#
# from .permissions import IsCreator, IsRegionHead, IsDepartmentHead
# from .models import (
#     User,
#     Department,
#     Case,
#     MaterialEvidence,
#     MaterialEvidenceEvent,
#     Session,
#     Camera,
#     AuditEntry,
#     EvidenceGroup,
#     FaceEncoding,
# )
# from .serializers import (
#     UserSerializer,
#     DepartmentSerializer,
#     CaseSerializer,
#     MaterialEvidenceSerializer,
#     MaterialEvidenceEventSerializer,
#     SessionSerializer,
#     CameraSerializer,
#     AuditEntrySerializer,
#     EvidenceGroupSerializer,
# )
#
#
# # ---------------------------
# # ViewSets for models
# # ---------------------------
#
# class UserViewSet(viewsets.ModelViewSet):
#     queryset = User.objects.all()
#     serializer_class = UserSerializer
#     permission_classes = [permissions.IsAuthenticated]
#
#     def get_queryset(self):
#         user = self.request.user
#
#         if user.role == "REGION_HEAD":
#             # Главный по региону видит всех сотрудников своего региона
#             return self.queryset.filter(region=user.region)
#         elif user.role == "DEPARTMENT_HEAD":
#             # Главный по отделению видит всех сотрудников своего отделения
#             return self.queryset.filter(department=user.department)
#         else:
#             # Обычные пользователи видят только себя
#             return self.queryset.filter(id=user.id)
#
#     def perform_create(self, serializer):
#         user = self.request.user
#
#         if user.role == "REGION_HEAD":
#             # REGION_HEAD может создавать пользователей в своем регионе
#             new_user_region = serializer.validated_data.get("region")
#             department = serializer.validated_data.get("department")
#
#             # Если указан отделение, проверяем, что оно принадлежит региону пользователя
#             if department and department.region != user.region:
#                 raise PermissionDenied(
#                     "Вы не можете назначить пользователя в отделение другого региона."
#                 )
#
#             # Если регион не указан, устанавливаем регион пользователя
#             if not new_user_region:
#                 serializer.validated_data["region"] = user.region
#             else:
#                 # Проверяем, что указанный регион совпадает с регионом пользователя
#                 if new_user_region != user.region:
#                     raise PermissionDenied(
#                         "Вы не можете создавать пользователей в другом регионе."
#                     )
#
#             serializer.save()
#         elif user.role == "DEPARTMENT_HEAD":
#             department = user.department
#             serializer.validated_data["department"] = department
#             serializer.validated_data[
#                 "role"] = "USER"  # DEPARTMENT_HEAD может создавать только пользователей с ролью USER
#
#             # Регион будет установлен автоматически в модели User
#             serializer.validated_data.pop("region", None)
#
#             serializer.save()
#         else:
#             raise PermissionDenied("У вас нет прав для создания пользователей.")
#
#     def update(self, request, *args, **kwargs):
#         user = request.user
#         instance = self.get_object()
#
#         # Проверяем права на изменение is_active
#         if "is_active" in request.data:
#             if user.role == "REGION_HEAD":
#                 # REGION_HEAD может изменять is_active для сотрудников своего региона
#                 if instance.region != user.region:
#                     raise PermissionDenied(
#                         "Вы не можете изменять статус этого пользователя."
#                     )
#             elif user.role == "DEPARTMENT_HEAD":
#                 # DEPARTMENT_HEAD может изменять is_active для сотрудников своего отделения
#                 if instance.department != user.department:
#                     raise PermissionDenied(
#                         "Вы не можете изменять статус этого пользователя."
#                     )
#             else:
#                 raise PermissionDenied(
#                     "У вас нет прав для изменения этого пользователя."
#                 )
#
#         # Проверяем, что DEPARTMENT_HEAD не может менять роль пользователя
#         if "role" in request.data and user.role == "DEPARTMENT_HEAD":
#             if request.data["role"] != "USER":
#                 raise PermissionDenied(
#                     "Вы не можете изменять роль пользователя."
#                 )
#
#         return super().update(request, *args, **kwargs)
#
#     @action(detail=False, methods=["get"])
#     def all_departments(self, request):
#         # Для REGION_HEAD возвращаем всех сотрудников региона
#         user = self.request.user
#         if user.role == "REGION_HEAD":
#             users = self.queryset.filter(region=user.region)
#             serializer = self.get_serializer(users, many=True)
#             return Response(serializer.data)
#         else:
#             raise PermissionDenied("У вас нет прав для доступа к этому ресурсу.")
#
#
# class DepartmentViewSet(viewsets.ModelViewSet):
#     queryset = Department.objects.all()
#     serializer_class = DepartmentSerializer
#
#     def get_permissions(self):
#         user = self.request.user
#         if user.role == "REGION_HEAD":
#             permission_classes = [IsAuthenticated, IsRegionHead]
#         else:
#             permission_classes = [IsAuthenticated]
#         return [permission() for permission in permission_classes]
#
#     def get_queryset(self):
#         user = self.request.user
#         if user.role == "REGION_HEAD":
#             # Видит все отделения в своем регионе
#             return Department.objects.filter(region=user.region)
#         else:
#             # Обычные пользователи не имеют доступа
#             self.permission_denied(
#                 self.request, message="Недостаточно прав для доступа к отделениям"
#             )
#
#     def perform_create(self, serializer):
#         user = self.request.user
#         if user.role == "REGION_HEAD":
#             # Может создавать отделения в своем регионе
#             serializer.save(region=user.region)
#         else:
#             self.permission_denied(
#                 self.request, message="Недостаточно прав для создания отделения"
#             )
#
#
# class CaseViewSet(viewsets.ModelViewSet):
#     queryset = Case.objects.all()
#     serializer_class = CaseSerializer
#     permission_classes = [IsAuthenticated]
#
#     # Добавляем фильтры
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter]
#     filterset_fields = ['department']  # Фильтрация по отделению
#     search_fields = ['name', 'creator__username']  # Поиск по названию дела и имени создателя
#
#     def get_permissions(self):
#         if self.action in ["update", "partial_update", "destroy"]:
#             permission_classes = [IsAuthenticated]
#         else:
#             permission_classes = [IsAuthenticated]
#         return [permission() for permission in permission_classes]
#
#     def get_queryset(self):
#         user = self.request.user
#
#         # Получаем параметры поиска и фильтрации
#         search_query = self.request.query_params.get("search", "").strip()
#         department_id = self.request.query_params.get("department")
#
#         # Инициализируем базовый фильтр
#         base_q_filter = Q()
#
#         if department_id:
#             base_q_filter &= Q(department_id=department_id)
#
#         # Инициализируем объект Q для поиска
#         q_objects = Q()
#
#         # Инициализируем переменные для хранения case_ids
#         case_ids_from_evidences = []
#         case_ids_from_groups = []
#
#         if search_query:
#             # Проверяем, является ли поисковый запрос штрихкодом
#             if search_query.isdigit() and len(search_query) == 13:
#                 # Ищем вещественные доказательства с данным штрихкодом
#                 material_evidences = MaterialEvidence.objects.filter(
#                     barcode=search_query
#                 )
#
#                 # Получаем ID дел, связанных с найденными вещественными доказательствами
#                 case_ids_from_evidences = material_evidences.values_list(
#                     "case_id", flat=True
#                 )
#
#                 # Если есть совпадения, добавляем их в фильтр
#                 if case_ids_from_evidences:
#                     q_objects |= Q(id__in=case_ids_from_evidences)
#
#                 # Ищем группы вещественных доказательств с данным штрихкодом
#                 evidence_groups = EvidenceGroup.objects.filter(barcode=search_query)
#                 case_ids_from_groups = evidence_groups.values_list(
#                     "case_id", flat=True
#                 )
#
#                 if case_ids_from_groups:
#                     q_objects |= Q(id__in=case_ids_from_groups)
#             else:
#                 # Поиск по названию дела и имени создателя
#                 q_objects |= Q(name__icontains=search_query) | Q(
#                     creator__username__icontains=search_query
#                 )
#
#         # Применяем фильтр доступа на основе роли пользователя
#         if user.role == "REGION_HEAD":
#             base_q_filter &= Q(department__region=user.region)
#         elif user.role == "DEPARTMENT_HEAD":
#             base_q_filter &= Q(department=user.department)
#         else:
#             # Обычный пользователь может видеть дела, где он является создателем или следователем
#             base_q_filter &= Q(creator=user) | Q(investigator=user)
#
#             if search_query and (case_ids_from_evidences or case_ids_from_groups):
#                 case_ids = set(case_ids_from_evidences) | set(case_ids_from_groups)
#                 base_q_filter |= Q(id__in=case_ids)
#
#         # Применяем фильтры к queryset
#         queryset = Case.objects.filter(base_q_filter & q_objects).distinct()
#
#         return queryset.select_related("creator", "investigator", "department")
#
#     def update(self, request, *args, **kwargs):
#         user = request.user
#         instance = self.get_object()
#         old_instance = model_to_dict(instance)
#
#         # Получаем данные из запроса
#         data = request.data
#         updated_fields = set(data.keys())
#
#         # Удаляем поля, которые не должны учитываться при проверке
#         ignored_fields = {'department_id', 'department'}
#         updated_fields -= ignored_fields
#
#         # Проверка прав доступа и валидация изменений
#         for field in ['investigator', 'creator']:
#             if field in updated_fields:
#                 new_user_id = data.get(field)
#                 try:
#                     new_user = User.objects.get(id=new_user_id)
#                 except User.DoesNotExist:
#                     raise ValidationError({field: f"Указанный пользователь для поля '{field}' не найден."})
#
#                 if user.role == 'REGION_HEAD':
#                     if new_user.region != user.region:
#                         raise PermissionDenied(
#                             f"Вы можете назначать только пользователей из вашего региона для поля '{field}'.")
#                 elif user.role == 'DEPARTMENT_HEAD':
#                     if new_user.department != user.department:
#                         raise PermissionDenied(
#                             f"Вы можете назначать только пользователей из вашего отделения для поля '{field}'.")
#                 else:
#                     raise PermissionDenied(f"Вы не можете менять поле '{field}'.")
#
#         # Проверяем права на изменение других полей
#         allowed_fields = {'name', 'description', 'active', 'investigator', 'creator'}
#         if user.role not in ['REGION_HEAD', 'DEPARTMENT_HEAD']:
#             # Обычные пользователи
#             if instance.investigator != user:
#                 raise PermissionDenied("Вы не являетесь следователем этого дела.")
#             disallowed_fields = updated_fields - allowed_fields
#             if disallowed_fields:
#                 raise PermissionDenied(f"Вы не можете обновлять поля: {', '.join(disallowed_fields)}")
#         else:
#             # REGION_HEAD и DEPARTMENT_HEAD могут менять разрешенные поля
#             disallowed_fields = updated_fields - allowed_fields
#             if disallowed_fields:
#                 raise PermissionDenied(f"Вы не можете обновлять поля: {', '.join(disallowed_fields)}")
#
#         # Вызываем оригинальный метод update с обновленными данными
#         serializer = self.get_serializer(instance, data=data, partial=True)
#         serializer.is_valid(raise_exception=True)
#         self.perform_update(serializer)
#
#         # Получаем обновленный экземпляр
#         new_instance = self.get_object()
#         new_instance_dict = model_to_dict(new_instance)
#
#         # Определяем, какие поля были изменены
#         changes = {}
#         for field in new_instance_dict.keys():
#             old_value = old_instance.get(field)
#             new_value = new_instance_dict.get(field)
#             if old_value != new_value:
#                 if field in ['investigator', 'creator']:
#                     old_user = User.objects.get(id=old_value) if old_value else None
#                     new_user = User.objects.get(id=new_value) if new_value else None
#                     old_value_display = f"{old_user.get_full_name()} - ({old_user.rank})" if old_user else None
#                     new_value_display = f"{new_user.get_full_name()} - ({new_user.rank})" if new_user else None
#                     changes[field] = {'old': old_value_display, 'new': new_value_display}
#                 else:
#                     changes[field] = {'old': old_value, 'new': new_value}
#
#         if changes:
#             # Создаем запись в AuditEntry
#             AuditEntry.objects.create(
#                 object_id=instance.id,
#                 object_name=instance.name,
#                 table_name='case',
#                 class_name='Case',
#                 action='update',
#                 fields=', '.join(changes.keys()),
#                 data=json.dumps(changes, ensure_ascii=False, default=str),
#                 user=user,
#                 case=instance  # Ссылка на дело
#             )
#
#         return Response(serializer.data)
#
#     def perform_create(self, serializer):
#         user = self.request.user
#         if not user.department:
#             raise PermissionDenied("У вас нет назначенного отделения для создания дела.")
#         serializer.save(
#             creator=user, investigator=user, department=user.department
#         )
#
#     @action(detail=False, methods=["get"])
#     def get_by_barcode(self, request):
#         barcode = request.query_params.get("barcode")
#         if not barcode:
#             return Response({"detail": "Требуется штрихкод."}, status=400)
#
#         user = request.user
#
#         # Ищем вещественное доказательство или группу по штрихкоду
#         material_evidence = MaterialEvidence.objects.filter(barcode=barcode).first()
#         evidence_group = EvidenceGroup.objects.filter(barcode=barcode).first()
#
#         # Определяем дело
#         case = None
#         if material_evidence:
#             case = material_evidence.case
#         elif evidence_group:
#             case = evidence_group.case
#
#         if not case:
#             return Response({"detail": "Дело не найдено."}, status=404)
#
#         # Проверяем права доступа
#         if user.role == "REGION_HEAD" and case.department.region != user.region:
#             raise PermissionDenied("У вас нет прав для доступа к этому делу.")
#         elif user.role == "DEPARTMENT_HEAD" and case.department != user.department:
#             raise PermissionDenied("У вас нет прав для доступа к этому делу.")
#         elif (
#                 user.role == "USER"
#                 and case.creator != user
#                 and case.investigator != user
#         ):
#             raise PermissionDenied("У вас нет прав для доступа к этому делу.")
#
#         # Возвращаем данные дела
#         serializer = self.get_serializer(case)
#         return Response(serializer.data)
#
#
# class MaterialEvidenceViewSet(viewsets.ModelViewSet):
#     queryset = MaterialEvidence.objects.all()
#     serializer_class = MaterialEvidenceSerializer
#     permission_classes = [IsAuthenticated]
#
#     # Добавляем фильтры
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter]
#     filterset_fields = {
#         'type': ['exact'],  # Фильтрация по типу ВД
#         'created': ['gte', 'lte'],  # Фильтрация по дате создания
#     }
#     search_fields = ['name', 'description']  # Поиск по названию и описанию
#
#     def get_queryset(self):
#         user = self.request.user
#         queryset = super().get_queryset()
#
#         # Фильтрация по ID дела, если указан параметр 'case'
#         case_id = self.request.query_params.get("case")
#         if case_id:
#             queryset = queryset.filter(case_id=case_id)
#
#         # Фильтрация на основе роли пользователя
#         if user.role == "REGION_HEAD":
#             queryset = queryset.filter(case__department__region=user.region)
#         elif user.role == "DEPARTMENT_HEAD":
#             queryset = queryset.filter(case__department=user.department)
#         else:
#             # Пользователь видит вещественные доказательства дел, где он является создателем или следователем
#             queryset = queryset.filter(
#                 Q(case__creator=user) | Q(case__investigator=user)
#             )
#
#         return queryset.select_related("case", "created_by")
#
#     def perform_create(self, serializer):
#         user = self.request.user
#         case = serializer.validated_data["case"]
#         if case.creator != user and case.investigator != user:
#             self.permission_denied(
#                 self.request, message="Вы не являетесь создателем или следователем этого дела."
#             )
#         serializer.save(created_by=user)
#         # Логирование создания вещественного доказательства происходит в модели
#
#     def update(self, request, *args, **kwargs):
#         user = request.user
#         instance = self.get_object()
#         case = instance.case
#
#         # Проверяем, является ли пользователь создателем или следователем дела
#         if case.creator != user and case.investigator != user:
#             raise PermissionDenied(
#                 "Вы не являетесь создателем или следователем этого дела и не можете изменять вещественные доказательства."
#             )
#
#         # Проверяем, что обновляется только разрешенные поля
#         allowed_fields = {"status", "name", "description"}
#         if not set(request.data.keys()).issubset(allowed_fields):
#             raise PermissionDenied(
#                 f"Вы можете изменять только поля: {', '.join(allowed_fields)}."
#             )
#
#         # Проверяем, является ли запрос частичным обновлением
#         partial = kwargs.pop("partial", False)
#
#         old_instance = model_to_dict(instance)
#
#         serializer = self.get_serializer(
#             instance, data=request.data, partial=partial
#         )
#         serializer.is_valid(raise_exception=True)
#         self.perform_update(serializer)
#
#         # Получаем обновленный экземпляр
#         new_instance = self.get_object()
#         new_instance_dict = model_to_dict(new_instance)
#
#         # Определяем, какие поля были изменены
#         changes = {}
#         for field in new_instance_dict.keys():
#             if field in allowed_fields:
#                 old_value = old_instance.get(field)
#                 new_value = new_instance_dict.get(field)
#                 if old_value != new_value:
#                     changes[field] = {'old': old_value, 'new': new_value}
#
#         return Response(serializer.data)
#
#     def partial_update(self, request, *args, **kwargs):
#         kwargs["partial"] = True
#         return self.update(request, *args, **kwargs)
#
#
# class MaterialEvidenceEventViewSet(viewsets.ModelViewSet):
#     queryset = MaterialEvidenceEvent.objects.all()
#     serializer_class = MaterialEvidenceEventSerializer
#     permission_classes = [IsAuthenticated]
#
#     def get_queryset(self):
#         user = self.request.user
#         if user.role == "REGION_HEAD":
#             # Видит все события ВД в своем регионе
#             material_evidence_ids = MaterialEvidence.objects.filter(
#                 case__department__region=user.region
#             ).values_list("id", flat=True)
#             return MaterialEvidenceEvent.objects.filter(
#                 material_evidence_id__in=material_evidence_ids
#             ).select_related("material_evidence", "user")
#         elif user.role == "DEPARTMENT_HEAD":
#             # Видит все события ВД в своем отделении
#             material_evidence_ids = MaterialEvidence.objects.filter(
#                 case__department=user.department
#             ).values_list("id", flat=True)
#             return MaterialEvidenceEvent.objects.filter(
#                 material_evidence_id__in=material_evidence_ids
#             ).select_related("material_evidence", "user")
#         else:
#             # Обычный пользователь видит только события ВД в делах, где он является создателем или следователем
#             material_evidence_ids = MaterialEvidence.objects.filter(
#                 Q(case__creator=user) | Q(case__investigator=user)
#             ).values_list("id", flat=True)
#             return MaterialEvidenceEvent.objects.filter(
#                 material_evidence_id__in=material_evidence_ids
#             ).select_related("material_evidence", "user")
#
#     def perform_create(self, serializer):
#         user = self.request.user
#         serializer.save(user=user)
#         # Логирование происходит в модели MaterialEvidenceEvent
#
#
# class EvidenceGroupViewSet(viewsets.ModelViewSet):
#     queryset = EvidenceGroup.objects.all()
#     serializer_class = EvidenceGroupSerializer
#     permission_classes = [permissions.IsAuthenticated]
#
#     def get_queryset(self):
#         user = self.request.user
#         case_id = self.request.query_params.get("case")
#         queryset = self.queryset
#
#         if case_id:
#             queryset = queryset.filter(case_id=case_id)
#
#         if user.role == "REGION_HEAD":
#             return queryset.filter(case__department__region=user.region)
#         elif user.role == "DEPARTMENT_HEAD":
#             return queryset.filter(case__department=user.department)
#         else:
#             # Пользователь видит группы в делах, где он является создателем или следователем
#             return queryset.filter(
#                 Q(case__creator=user) | Q(case__investigator=user)
#             )
#
#     def perform_create(self, serializer):
#         user = self.request.user
#         case = serializer.validated_data.get("case")
#
#         # Проверяем, является ли пользователь создателем или следователем дела
#         if case.creator != user and case.investigator != user:
#             raise PermissionDenied(
#                 "Вы не являетесь создателем или следователем этого дела и не можете добавлять группы."
#             )
#
#         serializer.save(created_by=user)
#         # Можно добавить логирование создания группы, если необходимо
#
#
# class SessionViewSet(viewsets.ModelViewSet):
#     queryset = Session.objects.all()
#     serializer_class = SessionSerializer
#     permission_classes = [IsAuthenticated]
#
#     # Добавляем фильтры
#     filter_backends = [DjangoFilterBackend, filters.SearchFilter]
#     filterset_fields = {
#         'login': ['gte', 'lte'],  # Фильтрация по дате входа
#     }
#
#     def get_queryset(self):
#         user = self.request.user
#         queryset = self.queryset.select_related('user')
#
#         # Получаем параметры фильтрации из запроса
#         user_id = self.request.query_params.get('user_id')
#         department_id = self.request.query_params.get('department_id')
#         region = self.request.query_params.get('region')
#
#         # Базовый фильтр на основе роли пользователя
#         if user.role == "REGION_HEAD":
#             queryset = queryset.filter(user__region=user.region)
#             # Проверяем, что запрашиваемый регион соответствует региону пользователя
#             if region and region != user.region:
#                 raise PermissionDenied("Вы не можете просматривать данные другого региона.")
#
#             # Проверяем отделение
#             if department_id:
#                 try:
#                     department = Department.objects.get(id=department_id)
#                 except Department.DoesNotExist:
#                     raise PermissionDenied("Отделение не найдено.")
#                 if department.region != user.region:
#                     raise PermissionDenied("Вы не можете просматривать данные этого отделения.")
#                 queryset = queryset.filter(user__department_id=department_id)
#
#             # Проверяем пользователя
#             if user_id:
#                 try:
#                     selected_user = User.objects.get(id=user_id)
#                 except User.DoesNotExist:
#                     raise PermissionDenied("Пользователь не найден.")
#                 if selected_user.region != user.region:
#                     raise PermissionDenied("Вы не можете просматривать данные этого пользователя.")
#                 queryset = queryset.filter(user_id=user_id)
#
#         elif user.role == "DEPARTMENT_HEAD":
#             queryset = queryset.filter(user__department=user.department)
#             # Проверяем, что запрашиваемое отделение соответствует отделению пользователя
#             if department_id and int(department_id) != user.department.id:
#                 raise PermissionDenied("Вы не можете просматривать данные другого отделения.")
#
#             # Проверяем пользователя
#             if user_id:
#                 try:
#                     selected_user = User.objects.get(id=user_id)
#                 except User.DoesNotExist:
#                     raise PermissionDenied("Пользователь не найден.")
#                 if selected_user.department != user.department:
#                     raise PermissionDenied("Вы не можете просматривать данные этого пользователя.")
#                 queryset = queryset.filter(user_id=user_id)
#
#         else:
#             queryset = queryset.filter(user=user)
#             # Обычные пользователи не могут применять фильтры
#
#         return queryset
#
#
# class CameraViewSet(viewsets.ModelViewSet):
#     queryset = Camera.objects.all()
#     serializer_class = CameraSerializer
#     permission_classes = [IsAuthenticated, IsRegionHead]
#
#     def get_queryset(self):
#         user = self.request.user
#         if user.role == "REGION_HEAD":
#             return self.queryset
#         else:
#             self.permission_denied(
#                 self.request, message="Недостаточно прав для доступа к камерам"
#             )
#
#
# class AuditEntryViewSet(viewsets.ModelViewSet):
#     queryset = AuditEntry.objects.all()
#     serializer_class = AuditEntrySerializer
#     permission_classes = [IsAuthenticated]
#
#     def get_queryset(self):
#         user = self.request.user
#         queryset = self.queryset
#
#         # Фильтрация по ID дела, если указан параметр 'case_id'
#         case_id = self.request.query_params.get('case_id')
#         if case_id:
#             queryset = queryset.filter(case_id=case_id)
#         else:
#             # Если 'case_id' не указан, запрещаем доступ
#             raise PermissionDenied("Требуется указать 'case_id' для доступа к записям аудита.")
#
#         # Получаем дело по 'case_id'
#         try:
#             case = Case.objects.get(id=case_id)
#         except Case.DoesNotExist:
#             raise PermissionDenied("Дело не найдено.")
#
#         # Сортировка по возрастанию даты создания
#         queryset = queryset.order_by('created')
#
#         # Проверка прав доступа на основе роли пользователя и принадлежности дела
#         if user.role == "REGION_HEAD":
#             # Главы регионов видят дела в своем регионе
#             if case.department.region != user.region:
#                 raise PermissionDenied("У вас нет прав для доступа к истории изменений этого дела.")
#             return queryset.select_related("user")
#         elif user.role == "DEPARTMENT_HEAD":
#             # Главы отделений видят дела в своем отделении
#             if case.department != user.department:
#                 raise PermissionDenied("У вас нет прав для доступа к истории изменений этого дела.")
#             return queryset.select_related("user")
#         else:
#             # Обычные пользователи могут видеть историю изменений своих дел
#             if case.creator == user or case.investigator == user:
#                 return queryset.select_related("user")
#             else:
#                 raise PermissionDenied("У вас нет прав для доступа к истории изменений этого дела.")
#
#
# # ---------------------------
# # Authentication and CSRF Views
# # ---------------------------
#
# @ensure_csrf_cookie
# @api_view(["GET"])
# @permission_classes([AllowAny])
# def get_csrf_token(request):
#     return JsonResponse({"detail": "CSRF cookie set"})
#
#
# @api_view(["POST"])
# @permission_classes([AllowAny])
# def login_view(request):
#     username = request.data.get("username")
#     password = request.data.get("password")
#     # logger.info(f"Попытка входа: {username}")
#     user = authenticate(request, username=username, password=password)
#     if user is not None:
#         # logger.info(f"Успешная аутентификация для пользователя: {user.username}")
#         request.session['temp_user_id'] = user.id
#
#         if 'archive' in username:
#             # Прямо логиним пользователя без биометрической аутентификации
#             login(request, user)
#             return JsonResponse({"detail": "Успешный вход в систему", "login_successful": True})
#
#         if user.biometric_registered:
#             # Требуется биометрическая аутентификация через WebSocket
#             return JsonResponse({"detail": "Требуется биометрическая аутентификация", "biometric_required": True})
#         else:
#             # Требуется регистрация биометрии через WebSocket
#             return JsonResponse({"detail": "Требуется регистрация биометрии", "biometric_registration_required": True})
#     else:
#         # logger.warning(f"Аутентификация не удалась для пользователя: {username}")
#         return JsonResponse({"detail": "Неверные учетные данные"}, status=401)
#
# @api_view(["POST"])
# def logout_view(request):
#     user = request.user
#     if user.is_authenticated:
#         logout(request)
#         return JsonResponse({"detail": "Вы успешно вышли из системы"})
#     else:
#         return JsonResponse({"detail": "Пользователь не аутентифицирован"}, status=400)
#
#
# @api_view(["GET"])
# def check_auth(request):
#     if request.user.is_authenticated:
#         return JsonResponse({"is_authenticated": True})
#     else:
#         return JsonResponse({"is_authenticated": False}, status=401)
#
#
# @api_view(["GET"])
# @permission_classes([IsAuthenticated])
# def current_user(request):
#     serializer = UserSerializer(request.user)
#     return Response(serializer.data)
#
# @api_view(['GET'])
# @permission_classes([AllowAny])
# def download_certificate(request):
#     file_path = settings.CERTIFICATE_FILE_PATH
#     if os.path.exists(file_path):
#         response = FileResponse(open(file_path, 'rb'), content_type='application/x-x509-ca-cert')
#         response['Content-Disposition'] = 'attachment; filename="certificate.crt"'
#         return response
#     else:
#         return Response({'detail': 'Файл не найден.'}, status=404)
