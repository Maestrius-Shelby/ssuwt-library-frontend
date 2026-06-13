from django.shortcuts import render
from rest_framework import generics
from rest_framework.response import Response
from rest_framework.views import APIView
from ssuwt.models import ScientificMaterials, Institutes, Rating, PublicationType, Department, WorkComment
from ssuwt.models import RelationshipType, ScientificMaterialsHuman, JobTitle, Human, VerificationOfWork
from ssuwt.serializer import InstitutesSerializer, PublicationTypeSerializer, HumanSerializer, ScientificMaterialsAuthorsSerializer, RatingSerializer
from ssuwt.serializer import DepartmentSerializer, WorkCommentSerializer, JobTitleSerializer, HumanAddSerializer, RelationshipTypeSerializer
from ssuwt.serializer import ScientificMaterialsHumanSerializer, VerificationOfWorkSerializer
from rest_framework.permissions import IsAuthenticated, AllowAny, IsAdminUser
from .roles_views import check_user_role
from rest_framework.parsers import MultiPartParser, FormParser
from django.http import QueryDict
import json


def index(request):
    scientificMaterials = ScientificMaterials.objects.all()
    return render(request, 'index.html', {'scientificMaterials': scientificMaterials})


class InstitutesListAPIView(generics.ListAPIView):
    queryset = Institutes.objects.all()
    serializer_class = InstitutesSerializer


class PublicationTypeListAPIView(generics.ListAPIView):
    queryset = PublicationType.objects.all()
    serializer_class = PublicationTypeSerializer


class RatingListAPIView(generics.ListAPIView):
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer


class ScientificMaterialsAPIView(APIView):
    def get(self, request, **kwargs):
        pk = kwargs.get("pk", None)
        print(f"pk: {pk}")

        if not pk:
            queryset = ScientificMaterials.objects.all()
            serializer = ScientificMaterialsAuthorsSerializer(
                queryset, many=True)
            return Response(serializer.data)

        instance = ScientificMaterials.objects.filter(pk=pk).first()
        if not instance:
            return Response({"detail": "Not found"}, status=404)

        serializer = ScientificMaterialsAuthorsSerializer(instance)
        return Response(serializer.data)


    def post(self, request):
        def querydict_to_json(querydict):
            """ Преобразует QueryDict в JSON-совместимый словарь с числовыми значениями """
            data = {}

            for key, values in querydict.lists():
                if len(values) == 1:
                    value = values[0]  # Берём первый (и единственный) элемент списка

                    if key == "authors":
                        try:
                            authors_data = json.loads(value)  # Декодируем JSON-строку
                            if isinstance(authors_data, list):
                                for author in authors_data:
                                    author['relationship_type'] = int(author['relationship_type'])  # 🔥 Приводим к int
                            value = authors_data
                        except json.JSONDecodeError:
                            pass  # Если не JSON, оставляем строкой
                        
                    elif key in ["publication_type", "publication_year", "rating", "department", "count_of_pages"]:
                        try:
                            value = int(value)  # Преобразуем числа
                        except ValueError:
                            pass
                else:
                    value = values  # Если это список, оставляем как есть

                data[key] = value

            return json.dumps(data, ensure_ascii=False, indent=4)
        
        parser_classes = [MultiPartParser, FormParser]
        print("Request data:", request.data)  # Логируем данные запроса
        data = request.data.copy()
        # Проверяем, является ли request.data QueryDict
        if isinstance(data, QueryDict):
            attached_file = data.pop("attached_file", None)  # Убираем файл временно

            json_data = querydict_to_json(data)  # Преобразуем QueryDict в JSON
            json_data_to_dict = json.loads(json_data)  # Преобразуем JSON-строку в словарь

            # Восстанавливаем файл в данные
            if attached_file:
                json_data_to_dict["attached_file"] = attached_file[0]  # Берем первый файл из списка

            print(f"\nИсправленные данные: {json_data_to_dict}")

            # Передаем **словарь** в сериализатор
            serializer = ScientificMaterialsAuthorsSerializer(data=json_data_to_dict)
        else:
            serializer = ScientificMaterialsAuthorsSerializer(data=data)

        # Проверяем валидацию
        serializer.is_valid(raise_exception=True)

        # Сохраняем объект
        serializer.save()
        return Response({'ScientificMaterials': serializer.data}, status=201)

    def put(self, request, *rgs, **kwargs):
        # Права доступа
        if not check_user_role(request, allowed_roles=['Заведующие кафедрой', 'Преподаватели']):
            return Response({"detail": "Недостаточно прав для доступа к данным."}, status=403)

        pk = kwargs.get("pk", None)
        if not pk:
            return Response({"error": "Method PUT not allowed"})

        try:
            instance = ScientificMaterials.objects.get(pk=pk)
        except:
            return Response({"error": "Object does not exists"})

        serializer = ScientificMaterialsAuthorsSerializer(
            data=request.data, instance=instance)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"post": serializer.data})

    def delete(self, request, *args, **kwargs):
        # Права доступа
        if not check_user_role(request, allowed_roles=[]):
            return Response({"detail": "Недостаточно прав для доступа к данным."}, status=403)
        pk = kwargs.get("pk", None)
        if not pk:
            return Response({"ERROR": "Delete Method Is Not Allowed"})

        try:
            instance = ScientificMaterials.objects.get(pk=pk)
            instance.delete()
        except:
            return Response({"ERROR": "Object Not Found !"})

        return Response({"post": f"Object {str(pk)} is deleted"})


class DepartmentListAPIView(generics.ListAPIView):
    queryset = Department.objects.all()
    serializer_class = DepartmentSerializer


class WorkCommentListAPIView(generics.ListAPIView):
    queryset = WorkComment.objects.all()
    serializer_class = WorkCommentSerializer


class JobTitleAPIView(generics.ListAPIView):
    queryset = JobTitle.objects.all()
    serializer_class = JobTitleSerializer


class HumanAPIView(APIView):

    # Получить данные о персоне
    def get(self, request):
        queryset = Human.objects.all()
        serializer = HumanSerializer(queryset, many=True).data
        return Response(list(serializer))

    # Добавить новую персону
    def post(self, request):
        print(request.data)
        serializer = HumanAddSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'Humans': serializer.data})

    # Изменить данные о персоне
    def put(self, request, *rgs, **kwargs):
        pk = kwargs.get("pk", None)
        if not pk:
            return Response({"error": "Method PUT not allowed"})

        try:
            instance = Human.objects.get(pk=pk)
        except:
            return Response({"error": "Object does not exists"})

        serializer = HumanAddSerializer(data=request.data, instance=instance)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({"post": serializer.data})

    # Удалить персону
    def delete(self, request, *args, **kwargs):
        pk = kwargs.get("pk", None)
        if not pk:
            return Response({"ERROR": "Delete Method Is Not Allowed"})

        try:
            instance = Human.objects.get(pk=pk)
            instance.delete()
        except:
            return Response({"ERROR": "Object Not Found !"})

        return Response({"post": f"Object {str(pk)} is deleted"})


class VerificationOfWorkAPIView(generics.ListAPIView):
    queryset = VerificationOfWork.objects.all()
    serializer_class = VerificationOfWorkSerializer


class RelationshipTypeAPIView(generics.ListAPIView):
    queryset = RelationshipType.objects.all()
    serializer_class = RelationshipTypeSerializer


class ScientificMaterialsHumanAPIView(generics.ListAPIView):
    queryset = ScientificMaterialsHuman.objects.all()
    serializer_class = ScientificMaterialsHumanSerializer


class ScientificMaterialsAuthorsAPIView(generics.ListAPIView):
    queryset = ScientificMaterials.objects.all()
    serializer_class = ScientificMaterialsAuthorsSerializer
