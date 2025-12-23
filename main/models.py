from django.db import models


class Model3D(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='models_3d/')
    preview = models.ImageField(upload_to='previews/', blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    drawing_pdf = models.FileField(upload_to="drawings/", blank=True)

    class Meta:
        verbose_name_plural = '3D модели'


