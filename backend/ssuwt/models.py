from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta


class JobTitle(models.Model):
    id = models.AutoField(primary_key=True, db_column='id_должности')
    name = models.CharField(max_length=50, db_column='название_должности')

    class Meta:
        db_table = 'должность'
        verbose_name = 'Должность'
        verbose_name_plural = 'Должность'

    def __str__(self):
        return self.name
    
class Institutes(models.Model):
    id = models.AutoField(primary_key=True, db_column='id_института')
    name = models.CharField(max_length=50, db_column='название_института')

    class Meta:
        db_table = 'институты'
        verbose_name = 'Институты'
        verbose_name_plural = 'Институты'

    def __str__(self):
        return self.name

class Department(models.Model):
    id = models.AutoField(primary_key=True, db_column='id_кафедры')
    institute = models.ForeignKey(Institutes, on_delete=models.CASCADE, db_column='id_института')
    name = models.CharField(max_length=50, db_column='название_кафедры')

    class Meta:
        db_table = 'кафедры'
        verbose_name = 'Кафедры'
        verbose_name_plural = 'Кафедры'

    def __str__(self):
        return f'{self.name}'
    
class Human(models.Model):
    id = models.AutoField(primary_key=True, db_column='id_человека')
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile', blank=True, null=True)
    fio = models.CharField(max_length=50, db_column='фио', verbose_name='фио')
    last_name = models.CharField(max_length=50, db_column='фамилия', blank=True, null=True, verbose_name='фамилия')
    first_name = models.CharField(max_length=50, db_column='имя', blank=True, null=True, verbose_name='имя')
    middle_name = models.CharField(max_length=50, db_column='отчество', blank=True, null=True, verbose_name='отчество')
    birth_date = models.DateField(db_column='дата_рождения', blank=True, null=True, verbose_name='дата рождения')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, db_column='институт_кафедра', blank=True, null=True, verbose_name='кафедра')
    job_title = models.ForeignKey(JobTitle, on_delete=models.CASCADE, db_column='должность', blank=True, null=True, verbose_name='должность')
    avatar = models.ImageField(upload_to='avatars/', blank=True, null=True, verbose_name='аватар')

    class Meta:
        db_table = 'человек'
        verbose_name = 'Автор'
        verbose_name_plural = 'Авторы'
        
    @property
    def institute(self):
        return self.department.institute if self.department else None

    def __str__(self):
        return f'{self.fio}'
    
class Rating(models.Model):
    id = models.AutoField(primary_key=True, db_column='id_рейтинга')
    name = models.CharField(max_length=50, db_column='название_рейтинга')

    class Meta:
        db_table = 'рейтинги'
        verbose_name = 'Рейтинги'
        verbose_name_plural = 'Рейтинги'

    def __str__(self):
        return self.name

class PublicationType(models.Model):
    id = models.AutoField(primary_key=True, db_column='id_типа_публикации')
    name = models.CharField(max_length=50, db_column='название_типа_публикации')

    class Meta:
        db_table = 'типы_публикаций'
        verbose_name = 'Типы публикаций'
        verbose_name_plural = 'Типы публикаций'
        
    def __str__(self):
        return self.name

class ScientificMaterials(models.Model):
    id = models.AutoField(primary_key=True, db_column='id_работы')
    title = models.CharField(max_length=300, db_column='название_работы', verbose_name='Название работы')
    publication_type = models.ForeignKey(PublicationType, on_delete=models.CASCADE, db_column='тип_публикации', verbose_name='Тип публикации')
    theme = models.CharField(max_length=100, db_column='тематика', blank=True, null=True, verbose_name='тематика')
    rating = models.ForeignKey(Rating, on_delete=models.CASCADE, db_column='рейтинг_работы', blank=True, null=True, verbose_name='рейтинг')
    journal_publisher = models.CharField(max_length=200, db_column='журнал/издатель', blank=True, null=True, verbose_name='журнал/издатель')
    publication_year = models.PositiveIntegerField(db_column='год_публикации', blank=True, null=True, verbose_name='год публикации')
    count_of_pages = models.CharField(max_length=10, db_column='кол-во_страниц', blank=True, null=True, verbose_name='количество страниц')
    department = models.ForeignKey(Department, on_delete=models.CASCADE, db_column='институт_кафедра', blank=True, null=True, verbose_name='кафедра')
    attached_file = models.FileField(upload_to='documents/', db_column='прикреплённый_файл', blank=True, null=True, verbose_name='прикреплённый файл')
    link = models.CharField(max_length=70, db_column='elibrary_url', blank=True, null=True, verbose_name='Elibrary url')
    
    class Meta:
        db_table = 'научные_материалы'
        verbose_name = 'Научные материалы'
        verbose_name_plural = 'Научные материалы'

    def __str__(self):
        return f'{self.title}'
    
    def get_authors_with_roles(self):
        return ", ".join(
            f"{rel.human.fio} ({rel.relationship_type.name})"
            for rel in self.scientificmaterialshuman_set.select_related("human", "relationship_type").all()
        )
    get_authors_with_roles.short_description = "Авторы"

class WorkComment(models.Model):
    id = models.AutoField(primary_key=True, db_column='id_комментария')
    work_id = models.ForeignKey(ScientificMaterials, on_delete=models.CASCADE, db_column='id_работы')
    comment = models.CharField(max_length=100, db_column='комментарий_к_работе')

    class Meta:
        db_table = 'комментарий_к_работе'
        verbose_name = 'Комментарий к работе'
        verbose_name_plural = 'Комментарии к работе'

    def __str__(self):
        return f'{self.work_id} {self.comment}'

class VerificationOfWork(models.Model):
    id = models.AutoField(primary_key=True, db_column='id_верификации')
    work_id = models.OneToOneField(ScientificMaterials, on_delete=models.CASCADE, db_column='id_работы', verbose_name='научная работа')
    is_verified = models.BooleanField(default=False, db_column='верификация_работы', verbose_name='верификация')

    class Meta:
        db_table = 'верификация_работы'
        verbose_name = 'Верификация работы'
        verbose_name_plural = 'Верификация работы'

    def __str__(self):
        return f'{self.work_id} {self.is_verified}'

class RelationshipType(models.Model):
    id = models.AutoField(primary_key=True, db_column='id_типа_связи')
    name = models.CharField(max_length=30, db_column='название_типа_связи')

    class Meta:
        db_table = 'тип_связи'
        verbose_name = 'Тип связи'
        verbose_name_plural = 'Тип связи'

    def __str__(self):
        return self.name

class ScientificMaterialsHuman(models.Model):
    work = models.ForeignKey(ScientificMaterials, on_delete=models.CASCADE, db_column='id_работы', verbose_name='научная работа')   
    human = models.ForeignKey(Human, on_delete=models.CASCADE, db_column='id_человека', verbose_name='пользователь')
    relationship_type = models.ForeignKey(RelationshipType, on_delete=models.CASCADE, db_column='id_типа_связи', verbose_name='роль')
    
    class Meta:
        db_table = 'научные_материалы_человек'
        verbose_name = 'Научный материал'
        verbose_name_plural = 'Научные материалы и автор'

    def __str__(self):
        return f'{self.work} {self.human} {self.relationship_type}'


from django.utils.timezone import now


class ActiveSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    login_time = models.DateTimeField(default=now)
    last_activity = models.DateTimeField(auto_now=True)
    token = models.TextField(unique=True) 
    


from django.utils import timezone
import datetime

class ParsingLock(models.Model):
    is_locked = models.BooleanField(default=False)
    started_at = models.DateTimeField(null=True, blank=True)
    unlocked_at = models.DateTimeField(null=True, blank=True)

    @property
    def remaining_time_seconds(self):
        if self.is_locked and self.unlocked_at:
            now = timezone.now()
            remaining = (self.unlocked_at - now).total_seconds()
            return max(0, int(remaining))
        return 0

    @property
    def remaining_time_formatted(self):
        seconds = self.remaining_time_seconds
        return str(datetime.timedelta(seconds=seconds))

    def __str__(self):
        return f"Блокировка: {'ВКЛ' if self.is_locked else 'ВЫКЛ'}"

    @classmethod
    def is_parsing_locked(cls):
        lock = cls.objects.first()
        if not lock:
            return False

        now = timezone.now()

        if lock.is_locked:
            if lock.unlocked_at is not None:
                if now >= lock.unlocked_at:
                    # Время разблокировки прошло — снимаем блокировку
                    lock.is_locked = False
                    lock.started_at = None
                    lock.unlocked_at = None
                    lock.save()
                    return False
                return True
            else:
                # unlocked_at не задан — разблокируем на всякий случай
                lock.is_locked = False
                lock.started_at = None
                lock.save()
                return False
        return False

    @classmethod
    def lock_parsing(cls, duration_hours=6):
        now = timezone.now()
        unlock_time = now + timedelta(hours=duration_hours)

        lock, created = cls.objects.get_or_create(id=1)
        lock.is_locked = True
        lock.started_at = now
        lock.unlocked_at = unlock_time
        lock.save()