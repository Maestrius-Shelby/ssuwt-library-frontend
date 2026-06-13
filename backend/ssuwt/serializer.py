from rest_framework import serializers
from .models import User, ScientificMaterials, Institutes, Rating
from .models import PublicationType, Department, WorkComment, JobTitle, Human
from .models import VerificationOfWork, RelationshipType, ScientificMaterialsHuman
from rest_framework_simplejwt.token_blacklist.models import OutstandingToken


class InstitutesSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institutes
        fields = '__all__'

class PublicationTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = PublicationType
        fields = '__all__'

class RatingSerializer(serializers.ModelSerializer):
    name = serializers.StringRelatedField()
    class Meta:
        model = Rating
        fields = '__all__'

class DepartmentSerializer(serializers.ModelSerializer):
    institute = serializers.StringRelatedField()
    class Meta:
        model = Department
        fields = '__all__'

class WorkCommentSerializer(serializers.ModelSerializer):
    class Meta:
        model = WorkComment
        fields = '__all__'
        
class JobTitleSerializer(serializers.ModelSerializer):
    class Meta:
        model = JobTitle
        fields = '__all__'

class VerificationOfWorkSerializer(serializers.ModelSerializer):
    class Meta:
        model = VerificationOfWork
        fields = '__all__'
        
class RelationshipTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = RelationshipType
        fields = '__all__'

class HumanSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer()
    job_title = serializers.StringRelatedField()
    avatar = serializers.FileField()
    class Meta:
        model = Human
        fields = ['id', 'user', 'fio', 'last_name', 'first_name', 'middle_name', 'birth_date', 'department', 'job_title', 'avatar']    
    
class HumanAddSerializer(serializers.ModelSerializer):
    class Meta:
        model = Human
        fields = ['id', 'fio', 'last_name', 'first_name', 'middle_name', 'birth_date', 'department', 'job_title']    
    
    def create(self, validated_data):
        new_human = Human.objects.create(**validated_data)
        return new_human
    
    def update(self, instance, validated_data):
        instance.fio = validated_data.get('fio', instance.fio)
        instance.last_name = validated_data.get('last_name', instance.last_name)
        instance.first_name = validated_data.get('first_name', instance.first_name)
        instance.middle_name = validated_data.get('middle_name', instance.middle_name)
        instance.birth_date = validated_data.get('birth_date', instance.birth_date)
        instance.department = validated_data.get('department', instance.department)
        instance.job_title = validated_data.get('job_title', instance.job_title)
        instance.save()
        return instance
        
class AuthorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Human
        fields = ['id', 'fio']
        
class AuthorIdSerializer(serializers.ModelSerializer):
    relationship_type = serializers.IntegerField()
    human = serializers.PrimaryKeyRelatedField(queryset=Human.objects.all())
    relationship_type = serializers.PrimaryKeyRelatedField(queryset=RelationshipType.objects.all())
    class Meta:
        model = ScientificMaterialsHuman
        fields = ['human', 'relationship_type']

class ScientificMaterialsHumanSerializer(serializers.ModelSerializer):
    human = AuthorSerializer()
    relationship_type = serializers.StringRelatedField()
    class Meta:
        model = ScientificMaterialsHuman
        fields = ['human', 'relationship_type', 'work']


class FixedScientificMaterialsHumanSerializer(serializers.ModelSerializer):
    human = serializers.PrimaryKeyRelatedField(queryset=Human.objects.all())
    relationship_type = serializers.PrimaryKeyRelatedField(queryset=RelationshipType.objects.all())

    class Meta:
        model = ScientificMaterialsHuman
        fields = ['human', 'relationship_type']


class ScientificMaterialsAuthorsSerializer(serializers.ModelSerializer):
    attached_file = serializers.SerializerMethodField()
    authors = FixedScientificMaterialsHumanSerializer(source='scientificmaterialshuman_set', many=True)
    class Meta:
        model = ScientificMaterials
        fields = '__all__'

    def get_attached_file(self, obj):
        request = self.context.get('request')  # Получаем request из контекста
        if isinstance(obj, dict):  # Если obj — это словарь
            attached_file_path = obj.get('attached_file')  # Извлекаем путь из словаря
        else:
            attached_file_path = getattr(obj, 'attached_file', None)  # Для объекта модели
    
        if attached_file_path:
            if request:
                return request.build_absolute_uri(attached_file_path.url)  # Генерация полного URL
            return attached_file_path.url
        return None  # Возвращаем None, если файла нет
    
    
    def create(self, validated_data):
        print(f"validated_data: {validated_data}", [])

        authors_data = validated_data.pop('scientificmaterialshuman_set')

        print("Authors data in create:", authors_data)  # Логируем данные авторов
        
        # Создаем копию данных для проверки дубликата, исключая поле attached_file
        duplicate_check_data = validated_data.copy()
        duplicate_check_data.pop('attached_file', None)
        # Проверяем, существует ли уже запись с такими же данными
        if ScientificMaterials.objects.filter(**duplicate_check_data).exists():
            raise serializers.ValidationError("Запись с такими данными уже существует")
        
        # Добавляем файл в validated_data, если он есть
        if 'attached_file' in self.initial_data:
            validated_data['attached_file'] = self.initial_data['attached_file']

        # Создаем объект ScientificMaterials
        scientific_material = ScientificMaterials.objects.create(**validated_data)
        verification = VerificationOfWork.objects.create(work_id=scientific_material)

        # Создаем записи для авторов
        for author_data in authors_data:
            ScientificMaterialsHuman.objects.create(
                human=author_data['human'],
                work=scientific_material,
                relationship_type=author_data['relationship_type']
            )

        return scientific_material
    
    def update(self, instance, validated_data):
        
        # Обновление научной статьи
        instance.attached_file = validated_data.get('attached_file', instance.attached_file)
        instance.title = validated_data.get('title', instance.title)
        instance.theme = validated_data.get('theme', instance.theme)
        instance.journal_publisher = validated_data.get('journal_publisher', instance.journal_publisher)
        instance.publication_year = validated_data.get('publication_year', instance.publication_year)
        instance.count_of_pages = validated_data.get('count_of_pages', instance.count_of_pages)
        instance.publication_type = validated_data.get('publication_type', instance.publication_type)
        instance.rating = validated_data.get('rating', instance.rating)
        instance.department = validated_data.get('department', instance.department)
        
        # Обновление или создание связей
        authors_data = self.initial_data.get('scientificmaterialshuman_set', [])
        print("Authors data in update:", authors_data)  # Логируем данные авторов
        if authors_data:
            for author_data in authors_data:
                human = author_data.get('human')
                relationship_type = author_data.get('relationship_type')

                # Найти существующую запись или создать новую
                author_relation, created = ScientificMaterialsHuman.objects.update_or_create(
                    work=instance,
                    human=human,
                    defaults={'relationship_type': relationship_type}
                )
                # Если новая запись не создана, то обновить существующую
                if not created:
                    author_relation.relationship_type = relationship_type
                    author_relation.save()
        
        instance.save()
        return instance
        
class ScientificMaterialsSerializer(serializers.ModelSerializer):
    department = serializers.StringRelatedField()
    rating = serializers.StringRelatedField()
    publication_type = serializers.StringRelatedField()
    attached_file = serializers.URLField()
    authors = AuthorSerializer(source='scientificmaterialshuman_set', many=True)
    class Meta:
        model = ScientificMaterials
        fields = '__all__'
    
class ScientificMaterialWithStatusSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()
    department = DepartmentSerializer()
    rating = serializers.StringRelatedField()
    publication_type = serializers.StringRelatedField()

    class Meta:
        model = ScientificMaterials
        fields = '__all__'  # Выводим все поля научной работы + статус верификации

    def get_status(self, obj):
        verification = VerificationOfWork.objects.filter(work_id=obj.id).first()
        return verification.is_verified if verification else "Не проверено"


class SearchSerializer(serializers.ModelSerializer):
    department = DepartmentSerializer()
    rating = serializers.StringRelatedField()
    publication_type = serializers.StringRelatedField()
    attached_file = serializers.SerializerMethodField()
    authors = ScientificMaterialsHumanSerializer(source='scientificmaterialshuman_set', many=True)
    class Meta:
        model = ScientificMaterials
        fields = '__all__'
    
    def get_attached_file(self, obj):
        request = self.context.get('request')  # Получаем request из контекста
        if isinstance(obj, dict):  # Если obj — это словарь
            attached_file_path = obj.get('attached_file')  # Извлекаем путь из словаря
        else:
            attached_file_path = getattr(obj, 'attached_file', None)  # Для объекта модели

        if attached_file_path:
            if request:
                return request.build_absolute_uri(attached_file_path.url)  # Генерация полного URL
            return attached_file_path.url
        return None  # Возвращаем None, если файла нет


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'

class ActiveTokenSerializer(serializers.ModelSerializer):
    user = UserSerializer()  # Получаем все данные пользователя
    human = serializers.SerializerMethodField()
    ip_address = serializers.SerializerMethodField()

    class Meta:
        model = OutstandingToken
        fields = ['user', 'token', 'expires_at', 'human', 'ip_address']

    def get_human(self, obj):
        # Получаем профиль пользователя, если он существует
        try:
            human_profile = Human.objects.get(user=obj.user)
            return HumanSerializer(human_profile).data
        except Human.DoesNotExist:
            return None

class ParsingStatusSerializer(serializers.Serializer):
    is_locked = serializers.BooleanField()
    locked_until = serializers.DateTimeField()