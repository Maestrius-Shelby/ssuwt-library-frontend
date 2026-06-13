from rest_framework_simplejwt.token_blacklist.models import OutstandingToken, BlacklistedToken
from rest_framework.response import Response
from ssuwt.serializer import HumanSerializer, ActiveTokenSerializer
from django.http import JsonResponse
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, IsAdminUser
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from rest_framework_simplejwt.views import TokenObtainPairView


# Авторизация

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        return token


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_profile(request):
    user = request.user
    profile = user.profile
    print(f'User: {user} - Profile: {profile}')
    serializer = HumanSerializer(profile, many=False)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def get_user(request):
    user = request.user  # Получаем пользователя из токена

    user_data = {
        "username": user.username,
        "email": user.email,
        "is_staff": user.is_staff,
        "is_active": user.is_active,
        "date_joined": user.date_joined,
        "groups": list(user.groups.values_list("name", flat=True))
    }
    return Response(user_data)


def get_routes(request):
    routes = [
        '/api/token',
        '/api/token/refresh'
    ]
    return JsonResponse(routes, safe=False)


@api_view(['GET'])
@permission_classes([IsAdminUser])  # Только для авторизованных пользователей
def active_tokens(request):
    # Фильтруем токены, не занесённые в черный список
    active_tokens = OutstandingToken.objects.filter(
        blacklistedtoken__isnull=True)

    # Уникализируем токены, чтобы не дублировались данные для одного пользователя
    user_tokens = {}
    for token in active_tokens:
        # Проверяем, был ли уже добавлен токен для этого пользователя
        if token.user_id not in user_tokens:
            user_tokens[token.user_id] = token

    # Получаем уникальные токены
    unique_tokens = list(user_tokens.values())

    # Сериализуем данные токенов с дополнительной информацией
    serializer = ActiveTokenSerializer(
        unique_tokens, many=True, context={'request': request})

    return Response({
        "active_tokens": serializer.data
    })


@api_view(['GET'])
# Только для авторизованных пользователей
@permission_classes([IsAuthenticated])
def blacklisted_tokens(request):
    blacklisted_tokens = BlacklistedToken.objects.all()
    return Response({
        "blacklisted_tokens": [
            {
                "jti": token.token.jti,
                "blacklisted_at": token.blacklisted_at,
            } for token in blacklisted_tokens
        ]
    })
