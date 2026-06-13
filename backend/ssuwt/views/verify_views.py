from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from ssuwt.models import VerificationOfWork
from .roles_views import check_user_role


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def verify_work(request):
    if not check_user_role(request, allowed_roles=['Администратор', 'Заведующие кафедрой']):
        return Response({"detail": "Недостаточно прав для верификации работ."}, status=status.HTTP_403_FORBIDDEN)

    verification_ids = request.data.get("verification_ids", [])

    if not isinstance(verification_ids, list) or not verification_ids:
        return Response({"error": "Некорректный формат данных. Ожидается список verification_ids."},
                        status=status.HTTP_400_BAD_REQUEST)

    updated_count = VerificationOfWork.objects.filter(work_id__in=verification_ids).update(is_verified=True)

    if updated_count == 0:
        return Response({"error": "Не найдено ни одной записи для верификации."}, status=status.HTTP_404_NOT_FOUND)

    return Response({"message": f"Верифицировано {updated_count} записей"}, status=status.HTTP_200_OK)

