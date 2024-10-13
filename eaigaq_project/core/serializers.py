# core/serializers.py

from rest_framework import serializers

from .models import (
    User, Department, Case, MaterialEvidence, MaterialEvidenceEvent,
    Session, Camera, AuditEntry, EvidenceGroup
)

class DepartmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Department
        fields = ['id', 'name', 'region']

class UserSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source='department',
        write_only=True,
        required=False
    )
    region_display = serializers.CharField(source='get_region_display', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    full_name = serializers.CharField(source='get_full_name', read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'password', 'first_name', 'last_name', 'full_name',
            'email', 'phone_number', 'rank', 'face_data',
            'department', 'department_id', 'region', 'region_display',
            'role', 'role_display', 'is_active'
        ]
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

class CaseSerializer(serializers.ModelSerializer):
    investigator = UserSerializer(read_only=True)
    creator_name = serializers.CharField(source='creator.get_full_name', read_only=True)
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source='department',
        write_only=True,
        required=False
    )
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Case
        fields = [
            'id', 'name', 'description', 'active',
            'creator', 'creator_name', 'investigator',
            'department', 'department_id', 'department_name', 'created', 'updated'
        ]
        read_only_fields = [
            'creator', 'creator_name', 'investigator', 'department',
            'department_name', 'created', 'updated'
        ]

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['creator'] = user
        validated_data['investigator'] = user
        validated_data['department'] = user.department
        return super().create(validated_data)

class MaterialEvidenceSerializer(serializers.ModelSerializer):
    case = CaseSerializer(read_only=True)
    case_id = serializers.PrimaryKeyRelatedField(
        queryset=Case.objects.all(),
        source='case',
        write_only=True,
        required=False  # Обновлено
    )
    created_by = UserSerializer(read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    group_id = serializers.PrimaryKeyRelatedField(
        queryset=EvidenceGroup.objects.all(),
        source='group',
        write_only=True,
        required=False,
        allow_null=True
    )
    group_name = serializers.CharField(source='group.name', read_only=True)

    # Добавляем required=False для полей
    name = serializers.CharField(required=False)
    description = serializers.CharField(required=False)

    class Meta:
        model = MaterialEvidence
        fields = [
            'id', 'name', 'description', 'case', 'case_id', 'created_by',
            'status', 'status_display', 'barcode', 'created', 'updated', 'active',
            'group_id', 'group_name',
        ]
        read_only_fields = ['created_by', 'created', 'updated', 'barcode']


    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)

class MaterialEvidenceEventSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    material_evidence = MaterialEvidenceSerializer(read_only=True)
    material_evidence_id = serializers.PrimaryKeyRelatedField(
        queryset=MaterialEvidence.objects.all(),
        source='material_evidence',
        write_only=True,
        required=True
    )
    action_display = serializers.CharField(source='get_action_display', read_only=True)

    class Meta:
        model = MaterialEvidenceEvent
        fields = ['id', 'user', 'material_evidence', 'material_evidence_id', 'action', 'action_display', 'created']
        read_only_fields = ['user', 'created', 'action_display']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class SessionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Session
        fields = ['id', 'user', 'login', 'logout', 'active']

class CameraSerializer(serializers.ModelSerializer):
    class Meta:
        model = Camera
        fields = ['id', 'device_id', 'name', 'type', 'created', 'updated', 'active']

class AuditEntrySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = AuditEntry
        fields = [
            'id', 'object_id', 'table_name', 'class_name', 'action',
            'fields', 'data', 'created', 'user'
        ]
        read_only_fields = ['created', 'user']

# core/serializers.py

class EvidenceGroupSerializer(serializers.ModelSerializer):
    material_evidences = MaterialEvidenceSerializer(many=True, read_only=True)
    barcode = serializers.CharField(read_only=True)
    case = serializers.PrimaryKeyRelatedField(queryset=Case.objects.all())
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = EvidenceGroup
        fields = [
            'id', 'name', 'case', 'created_by',
            'created', 'updated', 'active', 'material_evidences', 'barcode'
        ]
        read_only_fields = ['created_by', 'created', 'updated', 'material_evidences', 'barcode']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)
