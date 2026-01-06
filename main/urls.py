from django.urls import path
from .views import *

urlpatterns = [
    path('', Model3DListView.as_view(), name='model_list'),
    path('model/<int:pk>/', Model3DDetailView.as_view(), name='model_detail'),

    path('assemblies/', AssemblyListView.as_view(), name='assembly_list'),
    path('assemblies/<int:pk>/', AssemblyDetailView.as_view(), name='assembly_detail'),
]