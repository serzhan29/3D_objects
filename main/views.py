from django.shortcuts import render
from django.shortcuts import render
from django.views.generic import ListView, DetailView
from .models import Model3D


class Model3DListView(ListView):
    model = Model3D
    template_name = 'main/model_list.html'
    context_object_name = 'models'


class Model3DDetailView(DetailView):
    model = Model3D
    template_name = 'main/index.html'
    context_object_name = 'model'
