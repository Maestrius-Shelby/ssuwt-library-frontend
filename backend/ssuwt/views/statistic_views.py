from rest_framework.response import Response
from ssuwt.models import ScientificMaterials, Human, VerificationOfWork, ScientificMaterialsHuman
from rest_framework.decorators import api_view
from .roles_views import check_user_role


@api_view(['GET'])
def statistic(request):
    users = Human.objects.all().count()
    verificated_publications = VerificationOfWork.objects.filter(
        is_verified=True).values_list('work_id', flat=True)
    scientific_materials = ScientificMaterials.objects.filter(
        pk__in=verificated_publications)
    scientific_materials_count = scientific_materials.count()
    vak = scientific_materials.filter(rating__name="ВАК").count()
    rincz = scientific_materials.filter(rating__name="РИНЦ").count()
    zaubezh = scientific_materials.filter(rating__name="Зарубежное").count()
    elibrary = scientific_materials.filter(rating__name="Elibrary").count()
    vnutr = scientific_materials.filter(
        rating__name="Внутреннее (Отчеты, методички и тд)").count()

    return Response({
        "Статистика": [
            {
                "Число добавленных авторов": users,
                "Всего статей": scientific_materials_count,
                "ВАК": vak,
                "РИНЦ": rincz,
                "Зарубежное": zaubezh,
                "Elibrary": elibrary,
                "Внутреннее": vnutr
            }
        ]
    })

@api_view(['GET'])
def scientific_materials_statistics(request):
    # Проверяем роль пользователя
    if not check_user_role(request, allowed_roles=['Заведующие кафедрой', 'Преподаватели']):
        return Response({"detail": "Недостаточно прав для доступа к данным."}, status=403)
    
    user = request.user
    profile = user.profile
    profile_pk = profile.pk

    scientific_materials_count = ScientificMaterials.objects.filter(
        scientificmaterialshuman__human__pk=profile_pk
    ).distinct().count()

    scientific_materials_rating_count = ScientificMaterials.objects.filter(
        scientificmaterialshuman__human__pk=profile_pk,
        rating__name="РИНЦ"
    ).distinct().count()

    scientific_materials_supervisor_count = ScientificMaterialsHuman.objects.filter(
        human=profile_pk,
        relationship_type__name="Научный руководитель"
    ).distinct().count()

    return Response({
        "scientific_materials_count": scientific_materials_count,
        "scientific_materials_rating_count": scientific_materials_rating_count,
        "scientific_materials_supervisor_count": scientific_materials_supervisor_count,
    })