# core/views.py

from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.db.models import Q

from .permissions import IsCreator, IsRegionHead, IsDepartmentHead

from rest_framework.exceptions import PermissionDenied
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import (
    api_view,
    permission_classes,
    action,
)
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.filters import SearchFilter

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
            region = user.region
            department = serializer.validated_data.get("department")

            # Проверяем, что отделение принадлежит региону пользователя
            if department and department.region != region:
                raise PermissionDenied(
                    "Вы не можете назначить пользователя в отделение другого региона."
                )

            serializer.validated_data["region"] = region
            serializer.save()
        elif user.role == "DEPARTMENT_HEAD":
            department = user.department
            serializer.validated_data["department"] = department
            serializer.validated_data["region"] = department.region
            serializer.validated_data["role"] = "USER"  # DEPARTMENT_HEAD может создавать только пользователей с ролью USER
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
    filter_backends = [SearchFilter]
    search_fields = ["name", "creator__username"]

    def get_permissions(self):
        if self.action in ["update", "partial_update", "destroy"]:
            permission_classes = [IsAuthenticated, IsCreator]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user

        # Получаем параметры поиска
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

    def perform_create(self, serializer):
        user = self.request.user
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

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        # Фильтрация по ID дела, если указан параметр 'case'
        case_id = self.request.query_params.get("case")
        if case_id:
            queryset = queryset.filter(case_id=case_id)

        # Фильтрация на основе роли пользователя
        if user.role == "REGION_HEAD":
            return queryset.filter(
                case__department__region=user.region
            ).select_related("case", "created_by")
        elif user.role == "DEPARTMENT_HEAD":
            return queryset.filter(
                case__department=user.department
            ).select_related("case", "created_by")
        else:
            return queryset.filter(created_by=user).select_related(
                "case", "created_by"
            )

    def perform_create(self, serializer):
        user = self.request.user
        case = serializer.validated_data["case"]
        if case.creator != user:
            self.permission_denied(
                self.request, message="Вы не являетесь создателем этого дела."
            )
        serializer.save(created_by=user)

    def update(self, request, *args, **kwargs):
        user = request.user
        instance = self.get_object()
        case = instance.case

        # Проверяем, является ли пользователь создателем дела
        if case.creator != user:
            raise PermissionDenied(
                "Вы не являетесь создателем этого дела и не можете изменять вещественные доказательства."
            )

        # Проверяем, что обновляется только поле 'status'
        allowed_fields = {"status"}
        if not set(request.data.keys()).issubset(allowed_fields):
            raise PermissionDenied(
                "Вы можете изменять только статус вещественного доказательства."
            )

        # Проверяем, является ли запрос частичным обновлением
        partial = kwargs.pop("partial", False)

        serializer = self.get_serializer(
            instance, data=request.data, partial=partial
        )
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
            # Обычный пользователь видит только события своих ВД
            material_evidence_ids = MaterialEvidence.objects.filter(
                created_by=user
            ).values_list("id", flat=True)
            return MaterialEvidenceEvent.objects.filter(
                material_evidence_id__in=material_evidence_ids
            ).select_related("material_evidence", "user")

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


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
            return queryset.filter(created_by=user)

    def perform_create(self, serializer):
        user = self.request.user
        case = serializer.validated_data.get("case")

        # Проверяем, является ли пользователь создателем дела
        if case.creator != user:
            raise PermissionDenied(
                "Вы не являетесь создателем этого дела и не можете добавлять группы."
            )

        serializer.save(created_by=user)


class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == "REGION_HEAD":
            return Session.objects.filter(user__region=user.region).select_related(
                "user"
            )
        elif user.role == "DEPARTMENT_HEAD":
            return Session.objects.filter(
                user__department=user.department
            ).select_related("user")
        else:
            return Session.objects.filter(user=user).select_related("user")


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
        if user.role == "REGION_HEAD":
            return AuditEntry.objects.filter(user__region=user.region).select_related(
                "user"
            )
        elif user.role == "DEPARTMENT_HEAD":
            return AuditEntry.objects.filter(
                user__department=user.department
            ).select_related("user")
        else:
            return AuditEntry.objects.filter(user=user).select_related("user")


# ---------------------------
# Authentication and CSRF Views
# ---------------------------

# Заглушка для биометрической аутентификации
@api_view(["POST"])
@permission_classes([AllowAny])
def biometric_auth(request):
    # TODO: Реализовать биометрическую аутентификацию позже
    return Response({"message": "Biometric authentication placeholder"})


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
    print(f"Попытка входа: {username}")
    user = authenticate(request, username=username, password=password)
    if user is not None:
        print(f"Успешная аутентификация для пользователя: {user.username}")
        login(request, user)
        return JsonResponse({"detail": "Authentication successful"})
    else:
        print(f"Аутентификация не удалась для пользователя: {username}")
        return JsonResponse({"detail": "Invalid credentials"}, status=401)


@api_view(["POST"])
def logout_view(request):
    logout(request)
    return JsonResponse({"detail": "Logout successful"})


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
