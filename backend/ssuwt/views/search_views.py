from rest_framework.response import Response
from ssuwt.models import ScientificMaterials
from ssuwt.models import ScientificMaterialsHuman, VerificationOfWork
from ssuwt.serializer import SearchSerializer
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework import status
from django.db.models import Count, Q
from django.views.decorators.csrf import csrf_exempt
#from django.utils.decorators import method_decorator


#@method_decorator(csrf_exempt, name='dispatch')
@api_view(['POST'])
@csrf_exempt
@permission_classes([AllowAny])
def search_scientific_materials(request):
    if request.method == 'POST':
        data = request.data
        # Получение параметров из POST-запроса
        title = data.get('title', '').strip()
        publication_type = data.get('publicationType', None)
        theme = data.get('theme', '').strip()
        rating = data.get('rating', None)
        journal_publisher = data.get('journal_publisher', '').strip()
        publication_year = data.get('publicationYear', None)
        institute_id = data.get('institutes', None)
        department_id = data.get('department', None)
        author_ids = data.get('authors', None)
        supervisor_ids = data.get('supervisors', '')
        verificated_publications = VerificationOfWork.objects.filter(
            is_verified=True).values_list('work_id', flat=True)
        # Создание Q объекта для фильтрации
        query = Q()
        query &= Q(pk__in=verificated_publications)
        if title:
            query &= Q(title__icontains=title)
        if publication_type:
            query &= Q(publication_type_id=publication_type)
        if theme:
            query &= Q(theme__icontains=theme)
        if rating:
            query &= Q(rating_id=rating)
        if journal_publisher:
            query &= Q(journal_publisher__icontains=journal_publisher)
        if publication_year:
            query &= Q(publication_year__icontains=publication_year)
        if institute_id:
            query &= Q(department__institute_id=institute_id)
        if department_id:
            query &= Q(department_id=department_id)
        # Фильтрация работ, где присутствуют все переданные авторы
        if author_ids:
            # Выбираем work_id, для которых число уникальных авторов (из списка author_ids) равно длине author_ids
            works_with_authors = ScientificMaterialsHuman.objects.filter(
                human__in=author_ids,
                relationship_type=1  # Предполагаем, что тип 1 – это "Автор"
            ).values('work_id').annotate(
                num_authors=Count('human', distinct=True)
            ).filter(num_authors=len(author_ids)).values_list('work_id', flat=True)

            query &= Q(id__in=list(works_with_authors))

        # Аналогично для научных руководителей
        if supervisor_ids:
            works_with_supervisors = ScientificMaterialsHuman.objects.filter(
                human__in=supervisor_ids,
                relationship_type=2  # Предполагаем, что тип 2 – это "Научный руководитель"
            ).values('work_id').annotate(
                num_supervisors=Count('human', distinct=True)
            ).filter(num_supervisors=len(supervisor_ids)).values_list('work_id', flat=True)

            query &= Q(id__in=list(works_with_supervisors))

        # Применяем фильтры
        ScientificMaterialsQueryset = ScientificMaterials.objects.filter(
            query)
        # Сериализация данных (Научных материалов и авторов)
        scientificMaterialsSerializer = SearchSerializer(
            ScientificMaterialsQueryset, many=True, context={'request': request})
        print(
            f'\nДанные с клиента: {data}\n' +
            f'\nНазвание работы: {title}' +
            f'\nАвторы: {author_ids}' +
            f'\nТип публикации: {publication_type}' +
            f'\nТематика: {theme}' +
            f'\nНаучный руководитель: {supervisor_ids}' +
            f'\nРейтинг: {rating}' +
            f'\nИздатель: {journal_publisher}' +
            f'\nГод публикации: {publication_year}' +
            f'\nИнститут: {institute_id}' +
            f'\nКафедра: {department_id}' +
            f'\n\nScientificMaterialsQueryset: {ScientificMaterialsQueryset}\n')
        return Response(scientificMaterialsSerializer.data)
    return Response({'error': 'Только POST запросы допускаются'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@csrf_exempt
@permission_classes([AllowAny])
def main_search_scientific_materials(request):
    if request.method == 'POST':
        query = request.data.get('query', '').strip().lower()
        if not query:
            return Response({'error': 'Запрос не должен быть пустым'}, status=status.HTTP_400_BAD_REQUEST)
        try:
            verificated_publications = VerificationOfWork.objects.filter(
                is_verified=True).values_list('work_id', flat=True)
            print("verificated_publications: ", verificated_publications)
            # Создаем фильтры для поиска в каждом поле
            filters = Q()
            filters |= Q(title__icontains=query)
            filters |= Q(publication_type__name__icontains=query)
            filters |= Q(theme__icontains=query)
            filters |= Q(rating__name__icontains=query)
            filters |= Q(journal_publisher__icontains=query)
            filters |= Q(publication_year__icontains=query)
            filters |= Q(department__name__icontains=query)
            filters |= Q(
                scientificmaterialshuman__human_id__fio__icontains=query)
            filters |= Q(department__institute__name__icontains=query)
            filters &= Q(pk__in=verificated_publications)
            # Применяем фильтры к запросу
            ScientificMaterialsQueryset = ScientificMaterials.objects.filter(
                filters).distinct()
            scientificMaterialsSerializer = SearchSerializer(
                ScientificMaterialsQueryset, many=True)
            print(f'results:{scientificMaterialsSerializer.data}')
            return Response(scientificMaterialsSerializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return Response({'error': 'Только POST запросы допускаются'}, status=status.HTTP_400_BAD_REQUEST)
