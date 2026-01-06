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

    def __str__(self):
        return self.title




class Assembly(models.Model):
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = 'Сборка'
        verbose_name_plural = 'Сборки'

    def __str__(self):
        return self.title


class AssemblyStep(models.Model):
    assembly = models.ForeignKey(
        Assembly,
        on_delete=models.CASCADE,
        related_name='steps'
    )

    order = models.PositiveIntegerField()
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)

    models_3d = models.ManyToManyField(
        Model3D,
        related_name='assembly_steps',
        blank=True
    )

    class Meta:
        ordering = ['order']
        unique_together = ('assembly', 'order')
        verbose_name = 'Шаг сборки'
        verbose_name_plural = 'Шаги сборки'

    def __str__(self):
        return f"{self.assembly} — шаг {self.order}"
