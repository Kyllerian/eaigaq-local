# eaigaq_project/core/urls.py

from django.urls import include, path
from rest_framework import routers
from .views import (
    UserViewSet,
    DepartmentViewSet,
    CaseViewSet,
    MaterialEvidenceViewSet,
    MaterialEvidenceEventViewSet,
    SessionViewSet,
    CameraViewSet,
    AuditEntryViewSet,
    EvidenceGroupViewSet,
    DocumentViewSet,
    # Добавляем импорт CameraViewingSessionViewSet
    CameraViewingSessionViewSet,
    # Прочие методы
    get_csrf_token,
    login_view,
    logout_view,
    check_auth,
    current_user,
    download_certificate
)

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'departments', DepartmentViewSet)
router.register(r'cases', CaseViewSet)
router.register(r'material-evidences', MaterialEvidenceViewSet)
router.register(r'material-evidence-events', MaterialEvidenceEventViewSet)
router.register(r'sessions', SessionViewSet)
router.register(r'cameras', CameraViewSet, basename='camera')
router.register(r'audit-entries', AuditEntryViewSet)
router.register(r'evidence-groups', EvidenceGroupViewSet, basename='evidence-group')
router.register(r'documents', DocumentViewSet)
router.register(r'camera_viewing_sessions', CameraViewingSessionViewSet, basename='camera_viewing_sessions')

urlpatterns = [
    path('', include(router.urls)),
    path('get_csrf_token/', get_csrf_token, name='get_csrf_token'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('check_auth/', check_auth, name='check_auth'),
    path('current-user/', current_user, name='current_user'),
    path('download/certificate/', download_certificate, name='download_certificate'),
]

# # eaigaq_project/core/urls.py
#
# from django.urls import include, path
# from rest_framework import routers
# from .views import (
#     UserViewSet, DepartmentViewSet, CaseViewSet, MaterialEvidenceViewSet,
#     MaterialEvidenceEventViewSet, SessionViewSet, CameraViewSet, AuditEntryViewSet,
#     EvidenceGroupViewSet, DocumentViewSet,
#     get_csrf_token, login_view, logout_view, check_auth, current_user,
#     download_certificate
# )
#
# router = routers.DefaultRouter()
# router.register(r'users', UserViewSet)
# router.register(r'departments', DepartmentViewSet)
# router.register(r'cases', CaseViewSet)
# router.register(r'material-evidences', MaterialEvidenceViewSet)
# router.register(r'material-evidence-events', MaterialEvidenceEventViewSet)
# router.register(r'sessions', SessionViewSet)
# router.register(r'cameras', CameraViewSet, basename='camera')
# router.register(r'audit-entries', AuditEntryViewSet)
# router.register(r'evidence-groups', EvidenceGroupViewSet, basename='evidence-group')
# router.register(r'documents', DocumentViewSet)
#
# urlpatterns = [
#     path('', include(router.urls)),
#     path('get_csrf_token/', get_csrf_token, name='get_csrf_token'),
#     path('login/', login_view, name='login'),
#     path('logout/', logout_view, name='logout'),
#     path('check_auth/', check_auth, name='check_auth'),
#     path('current-user/', current_user, name='current_user'),
#     path('download/certificate/', download_certificate, name='download_certificate'),
# ]