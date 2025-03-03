# eaigaq_project/core/serializers.py

from rest_framework import serializers
from .models import (
    User, Department, Case, MaterialEvidence, MaterialEvidenceEvent,
    Session, Camera, AuditEntry, EvidenceGroup, FaceEncoding, Region, Document,
    # Импортируем нашу новую модель
    CameraViewingSession
)


class DepartmentSerializer(serializers.ModelSerializer):
    region_display = serializers.CharField(source='get_region_display', read_only=True)
    evidence_group_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Department
        fields = ['id', 'name', 'region', 'region_display', 'evidence_group_count']


class UserSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source='department',
        write_only=True,
        required=False
    )
    department_name = serializers.CharField(source='department.name', read_only=True)
    region_display = serializers.CharField(source='get_region_display', read_only=True)
    role_display = serializers.CharField(source='get_role_display', read_only=True)
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    region = serializers.ChoiceField(choices=Region.choices, required=False)
    biometric_registered = serializers.BooleanField(read_only=True)
    date_joined = serializers.DateTimeField(read_only=True)
    last_login = serializers.DateTimeField(read_only=True)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'password', 'first_name', 'last_name', 'full_name',
            'email', 'phone_number', 'rank',
            'department', 'department_id', 'department_name', 'region', 'region_display',
            'role', 'role_display', 'is_active', 'biometric_registered',
            'date_joined', 'last_login'
        ]
        extra_kwargs = {'password': {'write_only': True}}
        read_only_fields = [
            'region_display', 'biometric_registered', 'date_joined', 'last_login', 'department_name'
        ]

    def validate(self, attrs):
        role = attrs.get('role', getattr(self.instance, 'role', 'USER'))
        department = attrs.get('department', getattr(self.instance, 'department', None))
        region = attrs.get('region', getattr(self.instance, 'region', None))

        if role == 'REGION_HEAD':
            if not region:
                raise serializers.ValidationError({"region": "Поле 'region' обязательно для роли REGION_HEAD."})
        else:
            if not department:
                raise serializers.ValidationError({"department_id": "Поле 'department_id' обязательно для этой роли."})
        return attrs

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = User(**validated_data)
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


class FaceEncodingSerializer(serializers.ModelSerializer):
    class Meta:
        model = FaceEncoding
        fields = ['id', 'user', 'encoding', 'stage', 'created_at']
        read_only_fields = ['id', 'user', 'created_at']

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['user'] = user
        return super().create(validated_data)


class BiometricRegistrationSerializer(serializers.Serializer):
    image = serializers.ImageField(required=True)

    def validate(self, attrs):
        image = attrs.get('image')
        if not image:
            raise serializers.ValidationError({"image": "Требуется изображение для биометрической регистрации."})
        return attrs


class CaseSerializer(serializers.ModelSerializer):
    investigator = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False,
        allow_null=True
    )
    investigator_name = serializers.CharField(source='investigator.get_full_name', read_only=True)
    creator = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        required=False
    )
    creator_name = serializers.CharField(source='creator.get_full_name', read_only=True)
    department = DepartmentSerializer(read_only=True)
    department_id = serializers.PrimaryKeyRelatedField(
        queryset=Department.objects.all(),
        source='department',
        write_only=True,
        required=False
    )
    department_name = serializers.CharField(source='department.name', read_only=True)
    region_name = serializers.CharField(source='department.get_region_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)

    class Meta:
        model = Case
        fields = [
            'id', 'name', 'description', 'status', 'status_display', 'active',
            'creator', 'creator_name', 'investigator', 'investigator_name',
            'department', 'department_id', 'department_name', 'created', 'updated', 'region_name'
        ]
        read_only_fields = [
            'department', 'created', 'updated', 'region_name', 'creator_name', 'investigator_name', 'status_display'
        ]

    def create(self, validated_data):
        user = self.context['request'].user
        validated_data['creator'] = user
        validated_data['investigator'] = user
        validated_data['department'] = user.department
        return super().create(validated_data)


class DocumentSerializer(serializers.ModelSerializer):
    uploaded_by = UserSerializer(read_only=True)
    file = serializers.FileField()
    case_id = serializers.PrimaryKeyRelatedField(
        queryset=Case.objects.all(),
        source='case',
        write_only=True,
        required=False,
        allow_null=True
    )
    material_evidence_id = serializers.PrimaryKeyRelatedField(
        queryset=MaterialEvidence.objects.all(),
        source='material_evidence',
        write_only=True,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Document
        fields = [
            'id', 'file', 'uploaded_at', 'uploaded_by', 'description',
            'case', 'case_id', 'material_evidence', 'material_evidence_id'
        ]
        read_only_fields = ['id', 'uploaded_at', 'uploaded_by', 'case', 'material_evidence']

    def validate(self, attrs):
        case = attrs.get('case', self.instance.case if self.instance else None)
        material_evidence = attrs.get('material_evidence', self.instance.material_evidence if self.instance else None)
        if not case and not material_evidence:
            raise serializers.ValidationError(
                "Документ должен быть связан либо с делом, либо с вещественным доказательством."
            )
        return attrs

    def create(self, validated_data):
        validated_data['uploaded_by'] = self.context['request'].user
        return super().create(validated_data)


class NestedDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Document
        fields = ['id', 'description', 'uploaded_at', 'file']


class MaterialEvidenceSerializer(serializers.ModelSerializer):
    case_id = serializers.PrimaryKeyRelatedField(
        queryset=Case.objects.all(),
        source='case',
        write_only=False,
        required=True
    )
    case_name = serializers.CharField(source='case.name', read_only=True)
    case_description = serializers.CharField(source='case.description', read_only=True)
    creator_name = serializers.CharField(source='case.creator.get_full_name', read_only=True)
    investigator_name = serializers.CharField(source='case.investigator.get_full_name', read_only=True)
    created_by_id = serializers.PrimaryKeyRelatedField(read_only=True, source='created_by')
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    group_id = serializers.PrimaryKeyRelatedField(
        queryset=EvidenceGroup.objects.all(),
        source='group',
        write_only=True,
        required=False,
        allow_null=True
    )
    group_name = serializers.CharField(source='group.name', read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)

    department_id = serializers.IntegerField(source='case.department.id', read_only=True)
    department_name = serializers.CharField(source='case.department.name', read_only=True)
    region_name = serializers.CharField(source='case.department.get_region_display', read_only=True)

    class Meta:
        model = MaterialEvidence
        fields = [
            'id', 'name', 'description', 'case_id', 'case_name', 'case_description',
            'creator_name', 'investigator_name', 'created_by_id',
            'status', 'status_display', 'barcode', 'created', 'updated', 'active',
            'group_id', 'group_name', 'type', 'type_display',
            'department_id', 'department_name', 'region_name',
        ]
        read_only_fields = [
            'created_by_id', 'created', 'updated', 'barcode', 'case_name', 'case_description',
            'creator_name', 'investigator_name', 'group_name', 'type_display',
            'department_id', 'department_name', 'region_name'
        ]

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class NestedMaterialEvidenceSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    group_id = serializers.PrimaryKeyRelatedField(
        queryset=EvidenceGroup.objects.all(),
        source='group',
        write_only=True,
        required=False,
        allow_null=True
    )
    group_name = serializers.CharField(source='group.name', read_only=True)
    type_display = serializers.CharField(source='get_type_display', read_only=True)
    documents = NestedDocumentSerializer(many=True, read_only=True)

    department_id = serializers.IntegerField(source='case.department.id', read_only=True)
    department_name = serializers.CharField(source='case.department.name', read_only=True)
    region_name = serializers.CharField(source='case.department.get_region_display', read_only=True)

    case_id = serializers.PrimaryKeyRelatedField(read_only=True, source='case')
    case_name = serializers.CharField(source='case.name', read_only=True)
    case_description = serializers.CharField(source='case.description', read_only=True)
    creator_name = serializers.CharField(source='case.creator.get_full_name', read_only=True)
    investigator_name = serializers.CharField(source='case.investigator.get_full_name', read_only=True)

    class Meta:
        model = MaterialEvidence
        fields = [
            'id', 'name', 'description', 'status', 'status_display',
            'barcode', 'created', 'updated', 'active', 'group_id', 'group_name', 'type', 'type_display',
            'documents',
            'department_id', 'department_name', 'region_name',
            'case_id', 'case_name', 'case_description',
            'creator_name', 'investigator_name',
        ]
        read_only_fields = [
            'barcode', 'created', 'updated', 'active', 'group_name', 'type_display',
            'documents', 'department_id', 'department_name', 'region_name',
            'case_id', 'case_name', 'case_description',
            'creator_name', 'investigator_name',
        ]


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
        fields = [
            'id', 'user', 'material_evidence', 'material_evidence_id',
            'action', 'action_display', 'created'
        ]
        read_only_fields = ['user', 'created', 'action_display']

    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)


class SessionSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    user_id = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        source='user',
        write_only=True,
        required=False
    )
    department_name = serializers.CharField(source='user.department.name', read_only=True)
    region_name = serializers.CharField(source='user.get_region_display', read_only=True)
    role_display = serializers.CharField(source='user.get_role_display', read_only=True)

    # NEW: поле для last_ping, чтобы видеть/обновлять при необходимости
    last_ping = serializers.DateTimeField(read_only=True)

    class Meta:
        model = Session
        fields = [
            'id', 'user', 'user_id', 'login', 'logout', 'active',
            'department_name', 'region_name', 'role_display',
            'last_ping',
        ]
        read_only_fields = [
            'id', 'user', 'login', 'department_name',
            'region_name', 'role_display', 'last_ping'
        ]


class CameraSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)
    region_display = serializers.CharField(source='get_region_display', read_only=True)

    class Meta:
        model = Camera
        fields = [
            'id', 'device_id', 'name', 'ip_address', 'login', 'password',
            'department', 'department_name', 'region', 'region_display',
            'created', 'updated', 'active', 'mountpoint_id', 'viewers_count',
            'video_port', 'ffmpeg_pid'
        ]
        extra_kwargs = {
            'password': {'write_only': True},
            'mountpoint_id': {'read_only': True},
            'viewers_count': {'read_only': True},
            'video_port': {'read_only': True},
            'ffmpeg_pid': {'read_only': True}
        }


# NEW: Сериализатор для CameraViewingSession
class CameraViewingSessionSerializer(serializers.ModelSerializer):
    """
    Позволяет создать/читать запись о просмотре конкретной камеры в рамках Session.
    last_ping обычно обновляется из вьюшки (keepalive).
    """
    # Связанные объекты - по желанию можно делать "read_only" + "write_only" поля
    session = SessionSerializer(read_only=True)
    session_id = serializers.PrimaryKeyRelatedField(
        queryset=Session.objects.all(),
        source='session',
        write_only=True,
        required=True
    )
    camera = CameraSerializer(read_only=True)
    camera_id = serializers.PrimaryKeyRelatedField(
        queryset=Camera.objects.all(),
        source='camera',
        write_only=True,
        required=True
    )

    class Meta:
        model = CameraViewingSession
        fields = [
            'id',
            'session', 'session_id',
            'camera', 'camera_id',
            'last_ping',
            'created_at'
        ]
        read_only_fields = ['id', 'session', 'camera', 'created_at', 'last_ping']

    def create(self, validated_data):
        """
        Если нужно, в момент создания можно проставить last_ping = now().
        """
        # user = self.context['request'].user  # если нужно
        return super().create(validated_data)


class AuditEntrySerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    case = serializers.PrimaryKeyRelatedField(read_only=True)
    class_name_display = serializers.SerializerMethodField()

    class Meta:
        model = AuditEntry
        fields = [
            'id', 'object_id', 'object_name', 'table_name', 'class_name', 'class_name_display', 'action',
            'fields', 'data', 'created', 'user', 'case'
        ]
        read_only_fields = ['created', 'user', 'case']

    def get_class_name_display(self, obj):
        class_name_map = {
            'Case': 'Дело',
            'MaterialEvidence': 'Вещественное доказательство',
            'MaterialEvidenceEvent': 'Событие ВД',
            'EvidenceGroup': 'Группа ВД',
            'Document': 'Документ',
            # 'Camera': 'Камера',
            # 'User': 'Пользователь',
            # и т.д.
        }
        return class_name_map.get(obj.class_name, obj.class_name)


class EvidenceGroupSerializer(serializers.ModelSerializer):
    material_evidences = NestedMaterialEvidenceSerializer(many=True, read_only=True)
    barcode = serializers.CharField(read_only=True)
    case = serializers.PrimaryKeyRelatedField(queryset=Case.objects.all())
    created_by = UserSerializer(read_only=True)

    class Meta:
        model = EvidenceGroup
        fields = [
            'id', 'name', 'storage_place', 'case', 'created_by',
            'created', 'updated', 'active', 'material_evidences', 'barcode'
        ]
        read_only_fields = ['created_by', 'created', 'updated', 'material_evidences', 'barcode']

    def create(self, validated_data):
        validated_data['created_by'] = self.context['request'].user
        return super().create(validated_data)


class NestedEvidenceGroupSerializer(serializers.ModelSerializer):
    material_evidences = NestedMaterialEvidenceSerializer(many=True, read_only=True)
    barcode = serializers.CharField(read_only=True)

    class Meta:
        model = EvidenceGroup
        fields = ['id', 'name', 'storage_place', 'barcode', 'material_evidences']


class CaseDetailSerializer(serializers.ModelSerializer):
    investigator = UserSerializer(read_only=True)
    creator_name = serializers.CharField(source='creator.get_full_name', read_only=True)
    department = DepartmentSerializer(read_only=True)
    department_name = serializers.CharField(source='department.name', read_only=True)
    evidence_groups = NestedEvidenceGroupSerializer(many=True, read_only=True)
    region_name = serializers.CharField(source='department.get_region_display', read_only=True)
    documents = NestedDocumentSerializer(many=True, read_only=True)

    class Meta:
        model = Case
        fields = [
            'id', 'name', 'description', 'active',
            'creator', 'creator_name', 'investigator',
            'department', 'department_name', 'created', 'updated',
            'evidence_groups', 'region_name', 'documents'
        ]
        read_only_fields = [
            'creator', 'creator_name', 'investigator', 'department',
            'department_name', 'created', 'updated', 'evidence_groups', 'region_name', 'documents'
        ]



# # eaigaq_project/core/serializers.py
#
# from rest_framework import serializers
# from .models import (
#     User, Department, Case, MaterialEvidence, MaterialEvidenceEvent,
#     Session, Camera, AuditEntry, EvidenceGroup, FaceEncoding, Region, Document
# )
#
#
# class DepartmentSerializer(serializers.ModelSerializer):
#     region_display = serializers.CharField(source='get_region_display', read_only=True)
#     evidence_group_count = serializers.IntegerField(read_only=True)  # Добавлено поле
#
#     class Meta:
#         model = Department
#         fields = ['id', 'name', 'region', 'region_display', 'evidence_group_count']  # Добавили evidence_group_count
#
# class UserSerializer(serializers.ModelSerializer):
#     department = DepartmentSerializer(read_only=True)
#     department_id = serializers.PrimaryKeyRelatedField(
#         queryset=Department.objects.all(),
#         source='department',
#         write_only=True,
#         required=False
#     )
#     department_name = serializers.CharField(source='department.name', read_only=True)
#     region_display = serializers.CharField(source='get_region_display', read_only=True)
#     role_display = serializers.CharField(source='get_role_display', read_only=True)
#     full_name = serializers.CharField(source='get_full_name', read_only=True)
#     region = serializers.ChoiceField(choices=Region.choices, required=False)
#     biometric_registered = serializers.BooleanField(read_only=True)
#     date_joined = serializers.DateTimeField(read_only=True)
#     last_login = serializers.DateTimeField(read_only=True)
#
#     class Meta:
#         model = User
#         fields = [
#             'id', 'username', 'password', 'first_name', 'last_name', 'full_name',
#             'email', 'phone_number', 'rank',
#             'department', 'department_id', 'department_name', 'region', 'region_display',
#             'role', 'role_display', 'is_active', 'biometric_registered',
#             'date_joined', 'last_login'
#         ]
#         extra_kwargs = {'password': {'write_only': True}}
#         read_only_fields = [
#             'region_display', 'biometric_registered', 'date_joined', 'last_login', 'department_name'
#         ]
#
#     def validate(self, attrs):
#         # Получаем текущие значения из instance, если они не переданы в attrs
#         role = attrs.get('role', getattr(self.instance, 'role', 'USER'))
#         department = attrs.get('department', getattr(self.instance, 'department', None))
#         region = attrs.get('region', getattr(self.instance, 'region', None))
#
#         if role == 'REGION_HEAD':
#             # Для главы региона отделение не требуется, регион обязателен
#             if not region:
#                 raise serializers.ValidationError({"region": "Поле 'region' обязательно для роли REGION_HEAD."})
#         else:
#             # Для остальных отделение обязательно
#             if not department:
#                 raise serializers.ValidationError({"department_id": "Поле 'department_id' обязательно для этой роли."})
#             # Регион будет установлен автоматически в методе save модели User
#         return attrs
#
#     def create(self, validated_data):
#         password = validated_data.pop('password', None)
#         user = User(**validated_data)
#         if password:
#             user.set_password(password)
#         user.save()
#         return user
#
#     def update(self, instance, validated_data):
#         password = validated_data.pop('password', None)
#         # Обновляем остальные поля
#         user = super().update(instance, validated_data)
#         if password:
#             user.set_password(password)
#             user.save()
#         return user
#
#
# class FaceEncodingSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = FaceEncoding
#         fields = ['id', 'user', 'encoding', 'stage', 'created_at']
#         read_only_fields = ['id', 'user', 'created_at']
#
#     def create(self, validated_data):
#         user = self.context['request'].user
#         validated_data['user'] = user
#         return super().create(validated_data)
#
#
# class BiometricRegistrationSerializer(serializers.Serializer):
#     image = serializers.ImageField(required=True)
#
#     def validate(self, attrs):
#         image = attrs.get('image')
#         if not image:
#             raise serializers.ValidationError({"image": "Требуется изображение для биометрической регистрации."})
#         return attrs
#
# class CaseSerializer(serializers.ModelSerializer):
#     investigator = serializers.PrimaryKeyRelatedField(
#         queryset=User.objects.all(),
#         required=False,
#         allow_null=True
#     )
#     investigator_name = serializers.CharField(source='investigator.get_full_name', read_only=True)
#     creator = serializers.PrimaryKeyRelatedField(
#         queryset=User.objects.all(),
#         required=False
#     )
#     creator_name = serializers.CharField(source='creator.get_full_name', read_only=True)
#     department = DepartmentSerializer(read_only=True)
#     department_id = serializers.PrimaryKeyRelatedField(
#         queryset=Department.objects.all(),
#         source='department',
#         write_only=True,
#         required=False
#     )
#     department_name = serializers.CharField(source='department.name', read_only=True)
#     region_name = serializers.CharField(source='department.get_region_display', read_only=True)
#     status_display = serializers.CharField(source='get_status_display', read_only=True)
#
#     class Meta:
#         model = Case
#         fields = [
#             'id', 'name', 'description', 'status', 'status_display', 'active',
#             'creator', 'creator_name', 'investigator', 'investigator_name',
#             'department', 'department_id', 'department_name', 'created', 'updated', 'region_name'
#         ]
#         read_only_fields = [
#             'department', 'created', 'updated', 'region_name', 'creator_name', 'investigator_name', 'status_display'
#         ]
#
#     def create(self, validated_data):
#         user = self.context['request'].user
#         validated_data['creator'] = user
#         validated_data['investigator'] = user
#         validated_data['department'] = user.department
#         return super().create(validated_data)
#
#
#
# class DocumentSerializer(serializers.ModelSerializer):
#     uploaded_by = UserSerializer(read_only=True)
#     file = serializers.FileField()
#     case_id = serializers.PrimaryKeyRelatedField(
#         queryset=Case.objects.all(),
#         source='case',
#         write_only=True,
#         required=False,
#         allow_null=True
#     )
#     material_evidence_id = serializers.PrimaryKeyRelatedField(
#         queryset=MaterialEvidence.objects.all(),
#         source='material_evidence',
#         write_only=True,
#         required=False,
#         allow_null=True
#     )
#
#     class Meta:
#         model = Document
#         fields = [
#             'id', 'file', 'uploaded_at', 'uploaded_by', 'description',
#             'case', 'case_id', 'material_evidence', 'material_evidence_id'
#         ]
#         read_only_fields = ['id', 'uploaded_at', 'uploaded_by', 'case', 'material_evidence']
#
#     def validate(self, attrs):
#         # При обновлении проверяем, есть ли уже связанные объекты
#         case = attrs.get('case', self.instance.case if self.instance else None)
#         material_evidence = attrs.get('material_evidence', self.instance.material_evidence if self.instance else None)
#         if not case and not material_evidence:
#             raise serializers.ValidationError(
#                 "Документ должен быть связан либо с делом, либо с вещественным доказательством.")
#         return attrs
#
#     def create(self, validated_data):
#         validated_data['uploaded_by'] = self.context['request'].user
#         return super().create(validated_data)
#
#
# class NestedDocumentSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = Document
#         fields = ['id', 'description', 'uploaded_at', 'file']
#
#
# class MaterialEvidenceSerializer(serializers.ModelSerializer):
#     case_id = serializers.PrimaryKeyRelatedField(
#         queryset=Case.objects.all(),
#         source='case',
#         write_only=False,
#         required=True
#     )
#     case_name = serializers.CharField(source='case.name', read_only=True)
#     case_description = serializers.CharField(source='case.description', read_only=True)
#     creator_name = serializers.CharField(source='case.creator.get_full_name', read_only=True)
#     investigator_name = serializers.CharField(source='case.investigator.get_full_name', read_only=True)
#     created_by_id = serializers.PrimaryKeyRelatedField(read_only=True, source='created_by')
#     status_display = serializers.CharField(source='get_status_display', read_only=True)
#     group_id = serializers.PrimaryKeyRelatedField(
#         queryset=EvidenceGroup.objects.all(),
#         source='group',
#         write_only=True,
#         required=False,
#         allow_null=True
#     )
#     group_name = serializers.CharField(source='group.name', read_only=True)
#     type_display = serializers.CharField(source='get_type_display', read_only=True)
#
#     # Fields for department and region information
#     department_id = serializers.IntegerField(source='case.department.id', read_only=True)
#     department_name = serializers.CharField(source='case.department.name', read_only=True)
#     region_name = serializers.CharField(source='case.department.get_region_display', read_only=True)
#
#     class Meta:
#         model = MaterialEvidence
#         fields = [
#             'id', 'name', 'description', 'case_id', 'case_name', 'case_description',
#             'creator_name', 'investigator_name', 'created_by_id',
#             'status', 'status_display', 'barcode', 'created', 'updated', 'active',
#             'group_id', 'group_name', 'type', 'type_display',
#             'department_id', 'department_name', 'region_name',
#         ]
#         read_only_fields = [
#             'created_by_id', 'created', 'updated', 'barcode', 'case_name', 'case_description',
#             'creator_name', 'investigator_name', 'group_name', 'type_display',
#             'department_id', 'department_name', 'region_name'
#         ]
#
#     def create(self, validated_data):
#         validated_data['created_by'] = self.context['request'].user
#         return super().create(validated_data)
#
#
# class NestedMaterialEvidenceSerializer(serializers.ModelSerializer):
#     status_display = serializers.CharField(source='get_status_display', read_only=True)
#     group_id = serializers.PrimaryKeyRelatedField(
#         queryset=EvidenceGroup.objects.all(),
#         source='group',
#         write_only=True,
#         required=False,
#         allow_null=True
#     )
#     group_name = serializers.CharField(source='group.name', read_only=True)
#     type_display = serializers.CharField(source='get_type_display', read_only=True)
#     documents = NestedDocumentSerializer(many=True, read_only=True)
#
#     # Fields for department and region information
#     department_id = serializers.IntegerField(source='case.department.id', read_only=True)
#     department_name = serializers.CharField(source='case.department.name', read_only=True)
#     region_name = serializers.CharField(source='case.department.get_region_display', read_only=True)
#
#     # Additional fields for case and user information
#     case_id = serializers.PrimaryKeyRelatedField(read_only=True, source='case')
#     case_name = serializers.CharField(source='case.name', read_only=True)
#     case_description = serializers.CharField(source='case.description', read_only=True)
#     creator_name = serializers.CharField(source='case.creator.get_full_name', read_only=True)
#     investigator_name = serializers.CharField(source='case.investigator.get_full_name', read_only=True)
#
#     class Meta:
#         model = MaterialEvidence
#         fields = [
#             'id', 'name', 'description', 'status', 'status_display',
#             'barcode', 'created', 'updated', 'active', 'group_id', 'group_name', 'type', 'type_display',
#             'documents',
#             'department_id', 'department_name', 'region_name',
#             'case_id', 'case_name', 'case_description',
#             'creator_name', 'investigator_name',
#         ]
#         read_only_fields = [
#             'barcode', 'created', 'updated', 'active', 'group_name', 'type_display',
#             'documents', 'department_id', 'department_name', 'region_name',
#             'case_id', 'case_name', 'case_description',
#             'creator_name', 'investigator_name',
#         ]
#
#
#
# class MaterialEvidenceEventSerializer(serializers.ModelSerializer):
#     user = UserSerializer(read_only=True)
#     material_evidence = MaterialEvidenceSerializer(read_only=True)
#     material_evidence_id = serializers.PrimaryKeyRelatedField(
#         queryset=MaterialEvidence.objects.all(),
#         source='material_evidence',
#         write_only=True,
#         required=True
#     )
#     action_display = serializers.CharField(source='get_action_display', read_only=True)
#
#     class Meta:
#         model = MaterialEvidenceEvent
#         fields = [
#             'id', 'user', 'material_evidence', 'material_evidence_id',
#             'action', 'action_display', 'created'
#         ]
#         read_only_fields = ['user', 'created', 'action_display']
#
#     def create(self, validated_data):
#         validated_data['user'] = self.context['request'].user
#         return super().create(validated_data)
#
#
# class SessionSerializer(serializers.ModelSerializer):
#     user = UserSerializer(read_only=True)
#     user_id = serializers.PrimaryKeyRelatedField(
#         queryset=User.objects.all(),
#         source='user',
#         write_only=True,
#         required=False
#     )
#     department_name = serializers.CharField(source='user.department.name', read_only=True)
#     region_name = serializers.CharField(source='user.get_region_display', read_only=True)
#     role_display = serializers.CharField(source='user.get_role_display', read_only=True)
#
#     class Meta:
#         model = Session
#         fields = [
#             'id', 'user', 'user_id', 'login', 'logout', 'active',
#             'department_name', 'region_name', 'role_display'
#         ]
#         read_only_fields = ['id', 'user', 'login', 'department_name', 'region_name', 'role_display']
#
#
# class CameraSerializer(serializers.ModelSerializer):
#     department_name = serializers.CharField(source='department.name', read_only=True)
#     region_display = serializers.CharField(source='get_region_display', read_only=True)
#
#     class Meta:
#         model = Camera
#         fields = [
#             'id', 'device_id', 'name', 'ip_address', 'login', 'password',
#             'department', 'department_name', 'region', 'region_display',
#             'created', 'updated', 'active', 'mountpoint_id', 'viewers_count',
#             'video_port', 'ffmpeg_pid'
#         ]
#         extra_kwargs = {
#             'password': {'write_only': True},     # Пароль лучше скрыть или сделать write_only
#             'mountpoint_id': {'read_only': True},
#             'viewers_count': {'read_only': True},
#             'video_port': {'read_only': True},
#             'ffmpeg_pid': {'read_only': True}     # ffmpeg_pid тоже для информации, не редактируем
#         }
#
#
#
#
#
# class AuditEntrySerializer(serializers.ModelSerializer):
#     user = UserSerializer(read_only=True)
#     case = serializers.PrimaryKeyRelatedField(read_only=True)
#     class_name_display = serializers.SerializerMethodField()
#
#     class Meta:
#         model = AuditEntry
#         fields = [
#             'id', 'object_id', 'object_name', 'table_name', 'class_name', 'class_name_display', 'action',
#             'fields', 'data', 'created', 'user', 'case'
#         ]
#         read_only_fields = ['created', 'user', 'case']
#
#     def get_class_name_display(self, obj):
#         class_name_map = {
#             'Case': 'Дело',
#             'MaterialEvidence': 'Вещественное доказательство',
#             'MaterialEvidenceEvent': 'Событие ВД',
#             'EvidenceGroup': 'Группа ВД',
#             'Document': 'Документ',
#             # Добавьте другие классы при необходимости
#         }
#         return class_name_map.get(obj.class_name, obj.class_name)
#
# class EvidenceGroupSerializer(serializers.ModelSerializer):
#     material_evidences = NestedMaterialEvidenceSerializer(many=True, read_only=True)
#     barcode = serializers.CharField(read_only=True)
#     case = serializers.PrimaryKeyRelatedField(queryset=Case.objects.all())
#     created_by = UserSerializer(read_only=True)
#
#     class Meta:
#         model = EvidenceGroup
#         fields = [
#             'id', 'name', 'storage_place', 'case', 'created_by',
#             'created', 'updated', 'active', 'material_evidences', 'barcode'
#         ]
#         read_only_fields = ['created_by', 'created', 'updated', 'material_evidences', 'barcode']
#
#     def create(self, validated_data):
#         validated_data['created_by'] = self.context['request'].user
#         return super().create(validated_data)
#
# class NestedEvidenceGroupSerializer(serializers.ModelSerializer):
#     material_evidences = NestedMaterialEvidenceSerializer(many=True, read_only=True)
#     barcode = serializers.CharField(read_only=True)
#
#     class Meta:
#         model = EvidenceGroup
#         fields = ['id', 'name', 'storage_place', 'barcode', 'material_evidences']
#
#
# class CaseDetailSerializer(serializers.ModelSerializer):
#     investigator = UserSerializer(read_only=True)
#     creator_name = serializers.CharField(source='creator.get_full_name', read_only=True)
#     department = DepartmentSerializer(read_only=True)
#     department_name = serializers.CharField(source='department.name', read_only=True)
#     evidence_groups = NestedEvidenceGroupSerializer(many=True, read_only=True)
#     region_name = serializers.CharField(source='department.get_region_display', read_only=True)
#     documents = NestedDocumentSerializer(many=True, read_only=True)
#
#     class Meta:
#         model = Case
#         fields = [
#             'id', 'name', 'description', 'active',
#             'creator', 'creator_name', 'investigator',
#             'department', 'department_name', 'created', 'updated',
#             'evidence_groups', 'region_name', 'documents'
#         ]
#         read_only_fields = [
#             'creator', 'creator_name', 'investigator', 'department',
#             'department_name', 'created', 'updated', 'evidence_groups', 'region_name', 'documents'
#         ]
