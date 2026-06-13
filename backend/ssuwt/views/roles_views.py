from rest_framework.exceptions import NotAuthenticated


def user_info(request):
    """
    Функция для получения информации о пользователе. Только при POST-запросе
    """
    user = request.user
    if not user.is_authenticated:
        raise NotAuthenticated("Пользователь не авторизован")

    user_data = {
        "username": user.username,
        "email": user.email,
        "is_staff": user.is_staff,
        "is_active": user.is_active,
        "date_joined": user.date_joined,
        "groups": list(user.groups.values_list("name", flat=True))
    }
    return user_data


def check_user_role(request, allowed_roles=None):
    """
    Проверяет роль пользователя на основе данных, полученных через user_info.
    Возвращает True, если роль соответствует одной из разрешенных.
    Администратор и суперпользователь всегда имеют доступ.
    :param request: запрос пользователя
    :param allowed_roles: список допустимых ролей, которые могут иметь доступ
    :return: True если роль пользователя соответствует разрешённым, False в противном случае
    """
    user_data = user_info(
        request)  # Получаем данные пользователя через user_info
    user_groups = user_data["groups"]

    # Роли по умолчанию для администратора и суперпользователя
    if request.user.is_superuser or request.user.is_staff:
        return True  # Админ и суперпользователь имеют доступ всегда

    # Если разрешённые роли не переданы, то просто проверяем роли
    if allowed_roles is None:
        return False

    # Проверка наличия хотя бы одной разрешённой роли
    if any(role in user_groups for role in allowed_roles):
        return True

    return False  # Если роли не совпадают
