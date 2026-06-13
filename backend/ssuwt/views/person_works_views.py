from ssuwt.models import ScientificMaterials
from rest_framework.response import Response
from ssuwt.serializer import ScientificMaterialWithStatusSerializer
from rest_framework.decorators import api_view
from .roles_views import check_user_role


@api_view(['GET'])
def scientific_materias_for_person(request):
    # Проверяем роль пользователя
    if not check_user_role(request, allowed_roles=['Заведующие кафедрой', 'Преподаватели']):
        return Response({"detail": "Недостаточно прав для доступа к данным."}, status=403)
    
    user = request.user
    profile = user.profile

    scientific_materials = ScientificMaterials.objects.filter(
        scientificmaterialshuman__human__pk=profile.pk
    ).distinct()

    serializer = ScientificMaterialWithStatusSerializer(
        scientific_materials, many=True
    )
    return Response(serializer.data)
