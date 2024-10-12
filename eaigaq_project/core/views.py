# core/views.py

from django.contrib.auth import authenticate, login, logout
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie

from .permissions import IsCreator, IsRegionHead, IsDepartmentHead

from rest_framework.exceptions import PermissionDenied

from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response

from .models import (
    User, Department, Case, MaterialEvidence, MaterialEvidenceEvent,
    Session, Camera, AuditEntry, EvidenceGroup
)
from .serializers import (
    UserSerializer, DepartmentSerializer, CaseSerializer,
    MaterialEvidenceSerializer, MaterialEvidenceEventSerializer,
    SessionSerializer, CameraSerializer, AuditEntrySerializer, EvidenceGroupSerializer
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

        if user.role == 'REGION_HEAD':
            # Главный по региону видит всех сотрудников своего региона
            return self.queryset.filter(department__region=user.region)
        elif user.role == 'DEPARTMENT_HEAD':
            # Главный по отделению видит всех сотрудников своего отделения
            return self.queryset.filter(department=user.department)
        else:
            # Обычные пользователи видят только себя
            return self.queryset.filter(id=user.id)

    def update(self, request, *args, **kwargs):
        user = request.user
        instance = self.get_object()

        # Проверяем права на изменение is_active
        if 'is_active' in request.data:
            if user.role == 'REGION_HEAD':
                # REGION_HEAD может изменять is_active для сотрудников своего региона
                if instance.department.region != user.region:
                    raise PermissionDenied('Вы не можете изменять статус этого пользователя.')
            elif user.role == 'DEPARTMENT_HEAD':
                # DEPARTMENT_HEAD может изменять is_active для сотрудников своего отделения
                if instance.department != user.department:
                    raise PermissionDenied('Вы не можете изменять статус этого пользователя.')
            else:
                raise PermissionDenied('У вас нет прав для изменения этого пользователя.')

        return super().update(request, *args, **kwargs)

    @action(detail=False, methods=['get'])
    def all_departments(self, request):
        # Для REGION_HEAD возвращаем всех сотрудников региона
        user = self.request.user
        if user.role == 'REGION_HEAD':
            users = self.queryset.filter(department__region=user.region)
            serializer = self.get_serializer(users, many=True)
            return Response(serializer.data)
        else:
            raise PermissionDenied('У вас нет прав для доступа к этому ресурсу.')

class DepartmentViewSet(viewsets.ModelViewSet):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer

    def get_permissions(self):
        user = self.request.user
        if user.role == 'REGION_HEAD':
            permission_classes = [IsAuthenticated, IsRegionHead]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'REGION_HEAD':
            # Видит все отделения в своем регионе
            return Department.objects.filter(region=user.region)
        else:
            # Обычные пользователи не имеют доступа
            self.permission_denied(self.request, message='Недостаточно прав для доступа к отделениям')

    def perform_create(self, serializer):
        user = self.request.user
        if user.role == 'REGION_HEAD':
            # Может создавать отделения в своем регионе
            serializer.save(region=user.region)
        else:
            self.permission_denied(self.request, message='Недостаточно прав для создания отделения')

class CaseViewSet(viewsets.ModelViewSet):
    queryset = Case.objects.all()
    serializer_class = CaseSerializer

    def get_permissions(self):
        if self.action in ['update', 'partial_update', 'destroy']:
            permission_classes = [IsAuthenticated, IsCreator]
        else:
            permission_classes = [IsAuthenticated]
        return [permission() for permission in permission_classes]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'REGION_HEAD':
            # Главный по региону видит все дела в своем регионе
            return Case.objects.filter(department__region=user.region).select_related('creator', 'investigator', 'department')
        elif user.role == 'DEPARTMENT_HEAD':
            # Главный по отделению видит все дела своего отделения
            return Case.objects.filter(department=user.department).select_related('creator', 'investigator', 'department')
        else:
            # Обычный пользователь видит только свои созданные дела
            return Case.objects.filter(creator=user).select_related('creator', 'investigator', 'department')

    def perform_create(self, serializer):
        user = self.request.user
        serializer.save(creator=user, investigator=user, department=user.department)

class MaterialEvidenceViewSet(viewsets.ModelViewSet):
    queryset = MaterialEvidence.objects.all()
    serializer_class = MaterialEvidenceSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = super().get_queryset()

        # Фильтрация по ID дела, если указан параметр 'case'
        case_id = self.request.query_params.get('case')
        if case_id:
            queryset = queryset.filter(case_id=case_id)

        # Фильтрация на основе роли пользователя
        if user.role == 'REGION_HEAD':
            return queryset.filter(case__department__region=user.region).select_related('case', 'created_by')
        elif user.role == 'DEPARTMENT_HEAD':
            return queryset.filter(case__department=user.department).select_related('case', 'created_by')
        else:
            return queryset.filter(created_by=user).select_related('case', 'created_by')

    def perform_create(self, serializer):
        user = self.request.user
        case = serializer.validated_data['case']
        if case.creator != user:
            self.permission_denied(self.request, message='Вы не являетесь создателем этого дела.')
        serializer.save(created_by=user)

class MaterialEvidenceEventViewSet(viewsets.ModelViewSet):
    queryset = MaterialEvidenceEvent.objects.all()
    serializer_class = MaterialEvidenceEventSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'REGION_HEAD':
            # Видит все события ВД в своем регионе
            material_evidence_ids = MaterialEvidence.objects.filter(case__department__region=user.region).values_list('id', flat=True)
            return MaterialEvidenceEvent.objects.filter(material_evidence_id__in=material_evidence_ids).select_related('material_evidence', 'user')
        elif user.role == 'DEPARTMENT_HEAD':
            # Видит все события ВД в своем отделении
            material_evidence_ids = MaterialEvidence.objects.filter(case__department=user.department).values_list('id', flat=True)
            return MaterialEvidenceEvent.objects.filter(material_evidence_id__in=material_evidence_ids).select_related('material_evidence', 'user')
        else:
            # Обычный пользователь видит только события своих ВД
            material_evidence_ids = MaterialEvidence.objects.filter(created_by=user).values_list('id', flat=True)
            return MaterialEvidenceEvent.objects.filter(material_evidence_id__in=material_evidence_ids).select_related('material_evidence', 'user')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class EvidenceGroupViewSet(viewsets.ModelViewSet):
    queryset = EvidenceGroup.objects.all()
    serializer_class = EvidenceGroupSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        case_id = self.request.query_params.get('case')
        queryset = self.queryset

        if case_id:
            queryset = queryset.filter(case_id=case_id)

        if user.role == 'REGION_HEAD':
            return queryset.filter(case__department__region=user.region)
        elif user.role == 'DEPARTMENT_HEAD':
            return queryset.filter(case__department=user.department)
        else:
            return queryset.filter(created_by=user)

    def perform_create(self, serializer):
        user = self.request.user
        case = serializer.validated_data.get('case')

        # Проверяем, является ли пользователь создателем дела
        if case.creator != user:
            raise PermissionDenied('Вы не являетесь создателем этого дела и не можете добавлять группы.')

        serializer.save(created_by=user)

class SessionViewSet(viewsets.ModelViewSet):
    queryset = Session.objects.all()
    serializer_class = SessionSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'REGION_HEAD':
            return Session.objects.filter(user__region=user.region).select_related('user')
        elif user.role == 'DEPARTMENT_HEAD':
            return Session.objects.filter(user__department=user.department).select_related('user')
        else:
            return Session.objects.filter(user=user).select_related('user')

class CameraViewSet(viewsets.ModelViewSet):
    queryset = Camera.objects.all()
    serializer_class = CameraSerializer
    permission_classes = [IsAuthenticated, IsRegionHead]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'REGION_HEAD':
            return self.queryset
        else:
            self.permission_denied(self.request, message='Недостаточно прав для доступа к камерам')

class AuditEntryViewSet(viewsets.ModelViewSet):
    queryset = AuditEntry.objects.all()
    serializer_class = AuditEntrySerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.role == 'REGION_HEAD':
            return AuditEntry.objects.filter(user__region=user.region).select_related('user')
        elif user.role == 'DEPARTMENT_HEAD':
            return AuditEntry.objects.filter(user__department=user.department).select_related('user')
        else:
            return AuditEntry.objects.filter(user=user).select_related('user')

# ---------------------------
# Authentication and CSRF Views
# ---------------------------

# Заглушка для биометрической аутентификации
@api_view(['POST'])
@permission_classes([AllowAny])
def biometric_auth(request):
    # TODO: Реализовать биометрическую аутентификацию позже
    return Response({'message': 'Biometric authentication placeholder'})

@ensure_csrf_cookie
@api_view(['GET'])
@permission_classes([AllowAny])
def get_csrf_token(request):
    return JsonResponse({'detail': 'CSRF cookie set'})

@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')
    print(f"Попытка входа: {username}")
    user = authenticate(request, username=username, password=password)
    if user is not None:
        print(f"Успешная аутентификация для пользователя: {user.username}")
        login(request, user)
        return JsonResponse({'detail': 'Authentication successful'})
    else:
        print(f"Аутентификация не удалась для пользователя: {username}")
        return JsonResponse({'detail': 'Invalid credentials'}, status=401)

@api_view(['POST'])
def logout_view(request):
    logout(request)
    return JsonResponse({'detail': 'Logout successful'})

@api_view(['GET'])
def check_auth(request):
    if request.user.is_authenticated:
        return JsonResponse({'is_authenticated': True})
    else:
        return JsonResponse({'is_authenticated': False}, status=401)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    serializer = UserSerializer(request.user)
    return Response(serializer.data)
