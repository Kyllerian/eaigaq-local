# core/urls.py

from django.urls import include, path
from rest_framework import routers
from .views import (
    UserViewSet, DepartmentViewSet, CaseViewSet, MaterialEvidenceViewSet,
    MaterialEvidenceEventViewSet, SessionViewSet, CameraViewSet, AuditEntryViewSet,
    biometric_auth, get_csrf_token, login_view, logout_view, check_auth, current_user, EvidenceGroupViewSet,
)
from rest_framework.routers import DefaultRouter
from .views import UserViewSet

router = routers.DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'departments', DepartmentViewSet)
router.register(r'cases', CaseViewSet)
router.register(r'material-evidences', MaterialEvidenceViewSet)
router.register(r'material-evidence-events', MaterialEvidenceEventViewSet)
router.register(r'sessions', SessionViewSet)
router.register(r'cameras', CameraViewSet)
router.register(r'audit-entries', AuditEntryViewSet)
router.register(r'evidence-groups', EvidenceGroupViewSet, basename='evidence-group')


urlpatterns = [
    path('', include(router.urls)),
    path('biometric-auth/', biometric_auth, name='biometric_auth'),
    path('get_csrf_token/', get_csrf_token, name='get_csrf_token'),
    path('login/', login_view, name='login'),
    path('logout/', logout_view, name='logout'),
    path('check_auth/', check_auth, name='check_auth'),
    path('current-user/', current_user, name='current_user'),
]

# # core/urls.py
#
# from django.urls import include, path
# from rest_framework import routers
# from .views import (
#     UserViewSet, DepartmentViewSet, CaseViewSet, MaterialEvidenceViewSet, MaterialEvidenceEventViewSet,
#     SessionViewSet, CameraViewSet, AuditEntryViewSet, biometric_auth,
#     get_csrf_token, login_view, logout_view, check_auth,
# )
# from rest_framework.permissions import AllowAny
#
# router = routers.DefaultRouter()
# router.register(r'users', UserViewSet)
# router.register(r'departments', DepartmentViewSet)
# router.register(r'cases', CaseViewSet)
# router.register(r'material-evidences', MaterialEvidenceViewSet)
# router.register(r'material-evidence-events', MaterialEvidenceEventViewSet)
# router.register(r'sessions', SessionViewSet)
# router.register(r'cameras', CameraViewSet)
# router.register(r'audit-entries', AuditEntryViewSet)
#
# urlpatterns = [
#     path('', include(router.urls)),
#     path('biometric-auth/', biometric_auth, name='biometric_auth'),
#     path('get-csrf-token/', get_csrf_token, name='get_csrf_token'),
#     path('login/', login_view, name='login'),
#     path('logout/', logout_view, name='logout'),
#     path('check-auth/', check_auth, name='check_auth'),
# ]
#
