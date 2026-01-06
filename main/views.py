from django.shortcuts import render
from django.shortcuts import render
from django.views.generic import ListView, DetailView

from .models import Assembly, AssemblyStep, Model3D


class Model3DListView(ListView):
    model = Model3D
    template_name = 'main/model_list.html'
    context_object_name = 'models'


class Model3DDetailView(DetailView):
    model = Model3D
    template_name = 'main/index.html'
    context_object_name = 'model'


class AssemblyListView(ListView):
    model = Assembly
    template_name = 'main/assembly_list.html'
    context_object_name = 'assemblies'



class AssemblyDetailView(DetailView):
    model = Assembly
    template_name = 'main/assembly_detail.html'
    context_object_name = 'assembly'

    def get_context_data(self, **kwargs):
        context = super().get_context_data(**kwargs)
        context['steps'] = self.object.steps.prefetch_related('models_3d')
        return context
