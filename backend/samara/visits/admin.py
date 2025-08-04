from django.contrib import admin
from .models import Visit, VisitReport, Violation

admin.site.register(Visit)
admin.site.register(VisitReport)
admin.site.register(Violation)
