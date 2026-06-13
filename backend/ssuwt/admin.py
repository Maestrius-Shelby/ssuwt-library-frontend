from django.contrib import admin
from django.contrib.admin import SimpleListFilter
from .models import ScientificMaterials, Institutes, Rating
from .models import PublicationType, Department, JobTitle, Human
from .models import VerificationOfWork, RelationshipType
from .models import ScientificMaterialsHuman, ParsingLock
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from django.contrib.auth.models import User
from ssuwt.form import CustomUserCreationForm
from django import forms


# Регистрация моделей для административного интерфейса Django

# Кафедры
class DepartmentAdmin(admin.ModelAdmin):
    list_display =(
        'id',
        'institute',
        'name')
    
    list_display_links = ('id', 'institute', 'name',)
    
    search_fields = ('id', 'institute__name__icontains','name',)
    
admin.site.register(Department, DepartmentAdmin)

# Институты
class InstitutesAdmin(admin.ModelAdmin):
    list_display =(
        'id',
        'name')
    
    list_display_links = ('id', 'name',)
    
    search_fields = ('id', 'name',)
    
admin.site.register(Institutes, InstitutesAdmin)

class AuthorFilter(SimpleListFilter):
    title = 'Автор'
    parameter_name = 'author'

    def lookups(self, request, model_admin):
        authors = Human.objects.all()
        return [(author.id, author.fio) for author in authors]

    def queryset(self, request, queryset):
        if self.value():
            return queryset.filter(scientificmaterialshuman__human__id=self.value())
        return queryset

class ScientificMaterialsHumanInline(admin.TabularInline):
    model = ScientificMaterialsHuman
    extra = 1
    autocomplete_fields = ['human']  # Включаем мини-поиск по авторам

# Научные материалы
class ScientificMaterialsAdmin(admin.ModelAdmin):
    list_display = (
        'id',
        'title',
        'get_authors_with_roles',
        'publication_type',
        'theme',
        'rating',
        'journal_publisher',
        'publication_year',
        'count_of_pages',
        'department',
        'link',
        'attached_file',)
    
    list_display_links = ('id', 'title')
    
    search_fields = (
        'id',
        'title__icontains',
        'publication_type__name__icontains',
        'theme__icontains',
        'rating__name__icontains',
        'journal_publisher__icontains',
        'publication_year__icontains',
        'count_of_pages__icontains',
        'department__name__icontains',
        'attached_file__icontains',
        'link__icontains',
        'scientificmaterialshuman__human__fio', 
        'scientificmaterialshuman__relationship_type__name')
    
    inlines = [ScientificMaterialsHumanInline]
    
    list_filter = ['publication_type', 'publication_year', 'rating', 'department', 'journal_publisher', AuthorFilter]
    
admin.site.register(ScientificMaterials, ScientificMaterialsAdmin)

# Рейтинги
class RatingAdmin(admin.ModelAdmin):
    list_display =(
        'id',
        'name')
    
    list_display_links = ('id', 'name',)
    
    search_fields = ('id', 'name',)

admin.site.register(Rating, RatingAdmin)

# Тип публикаций
class PublicationTypeAdmin(admin.ModelAdmin):
    list_display =(
        'id',
        'name')
    
    list_display_links = ('id', 'name',)
    
    search_fields = ('id', 'name',)

admin.site.register(PublicationType, PublicationTypeAdmin)

# Должность
class JobTitleAdmin(admin.ModelAdmin):
    list_display =(
        'id',
        'name')
    
    list_display_links = ('id', 'name',)
    
    search_fields = ('id', 'name',)

admin.site.register(JobTitle, JobTitleAdmin)

class HumanAdminForm(forms.ModelForm):
    class Meta:
        model = Human
        fields = '__all__'
        widgets = {
            'fio': forms.TextInput(attrs={'placeholder': 'Например, Иванов И.И.'}),
        }
        
    def __init__(self, *args, **kwargs):
        super(HumanAdminForm, self).__init__(*args, **kwargs)
        self.fields['department'].label_from_instance = lambda obj: f"{obj.name} ({obj.institute.name})" if obj.institute else obj.name
        
class HumanInline(admin.StackedInline):  # можно заменить на TabularInline
    model = Human
    extra = 0
    can_delete = False
    fk_name = 'user'

# Авторы
class HumanAdmin(admin.ModelAdmin):
    
    form = HumanAdminForm
    
    list_display =(
        'id',
        'user',
        'fio',
        'last_name',
        'first_name',
        'middle_name',
        'birth_date',
        'get_institute',
        'department',
        'job_title',
        'avatar')
    
    list_display_links = ('id', 'user', 'fio')
    
    search_fields = (
        'id', 
        'user__username__icontains',
        'fio',
        'last_name',
        'first_name',
        'middle_name',
        'birth_date',
        'department__name__icontains',
        'department__institute__name__icontains',
        'job_title__name__icontains',
        )
    
    def get_institute(self, obj):
        return obj.institute
    get_institute.short_description = 'Институт'
    
    
    
admin.site.register(Human, HumanAdmin)

# Верификация работы
class VerificationOfWorkAdmin(admin.ModelAdmin):
    list_display =(
        'id',
        'work_id',
        'is_verified')
    
    list_display_links = ('id', 'work_id', 'is_verified')
    
    search_fields = ('id', 'work_id__title__icontains',)

admin.site.register(VerificationOfWork, VerificationOfWorkAdmin)

# Тип связи
class RelationshipTypeAdmin(admin.ModelAdmin):
    list_display =(
        'id',
        'name')
    
    list_display_links = ('id', 'name',)
    
    search_fields = ('id', 'name',)

admin.site.register(RelationshipType, RelationshipTypeAdmin)

@admin.register(ParsingLock)
class ParsingLockAdmin(admin.ModelAdmin):
    list_display = (
        'is_locked',
        'started_at',
        'unlocked_at',
        'remaining_time_formatted',
        'remaining_time_seconds',
    )
    readonly_fields = (
        'remaining_time_formatted',
        'remaining_time_seconds',
    )
    list_display_links = (
        'is_locked',
        'started_at',
        'unlocked_at',
        'remaining_time_formatted',
        'remaining_time_seconds',
    )

    def has_add_permission(self, request):
        # Ограничим добавление новой записи — допускаем только одну
        return not ParsingLock.objects.exists()
    
class CustomUserAdmin(BaseUserAdmin):
    add_form = CustomUserCreationForm
    inlines = (HumanInline,)
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'password1', 'password2', 'group'),
        }),
    )

    def save_model(self, request, obj, form, change):
        super().save_model(request, obj, form, change)
        # Обязательно добавляем выбранную группу
        if "group" in form.cleaned_data:
            obj.groups.set([form.cleaned_data["group"]])

admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)