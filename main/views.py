from django.shortcuts import render
from django.shortcuts import render
from .models import Model3D

def index(request):
    model = Model3D.objects.first()  # пока берём первую модель
    return render(request, 'main/index.html', {
        'model': model
    })

