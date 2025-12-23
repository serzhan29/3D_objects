from django.urls import path
from .views import *

urlpatterns = [
    path('', Model3DListView.as_view(), name='model_list'),
    path('model/<int:pk>/', Model3DDetailView.as_view(), name='model_detail'),
]