from django.urls import path
from ssuwt.views.base_views import ScientificMaterialsHumanAPIView
from ssuwt.views.base_views import ScientificMaterialsAPIView
from ssuwt.views.base_views import InstitutesListAPIView, JobTitleAPIView
from ssuwt.views.base_views import RatingListAPIView, HumanAPIView
from ssuwt.views.base_views import DepartmentListAPIView
from ssuwt.views.base_views import WorkCommentListAPIView
from ssuwt.views.base_views import VerificationOfWorkAPIView
from ssuwt.views.base_views import RelationshipTypeAPIView
from ssuwt.views.base_views import PublicationTypeListAPIView


urlpatterns = [

    path('scientific_materials/',
         ScientificMaterialsAPIView.as_view(),
         name='scientific_materials'),

    path('scientific_materials/<int:pk>',
         ScientificMaterialsAPIView.as_view(),
         name='scientific_materials'),

    path('scientific_materials_human/',
         ScientificMaterialsHumanAPIView.as_view(),
         name='scientific_materials_human'),

    path('institutes/',
         InstitutesListAPIView.as_view(),
         name='institutes'),

    path('publication_type/',
         PublicationTypeListAPIView.as_view(),
         name='publication_type'),

    path('rating/',
         RatingListAPIView.as_view(),
         name='rating'),

    path('department/',
         DepartmentListAPIView.as_view(),
         name='department'),

    path('work_comment/',
         WorkCommentListAPIView.as_view(),
         name='work_comment'),

    path('job_title/',
         JobTitleAPIView.as_view(),
         name='job_title'),

    path('human/',
         HumanAPIView.as_view(),
         name='human'),

    path('human/<int:pk>',
         HumanAPIView.as_view(),
         name='human_update'),

    path('verification_of_work/',
         VerificationOfWorkAPIView.as_view(),
         name='verification_of_work'),

    path('relationship_type/',
         RelationshipTypeAPIView.as_view(),
         name='relationship_type'),
]
