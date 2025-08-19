from django.conf import settings
from django.db.utils import IntegrityError
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.utils.translation import gettext_lazy as _

from collections import Counter
from django.shortcuts import get_object_or_404

from projects.models import Location
from employees.models import SecurityGuard, Shift
from .models import ShiftAttendance, SecurityGuardAttendance


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def record_shift_attendance(request):
    data = request.data
    user = request.user

    location = Location.objects.get(id=data['location'])
    shift = Shift.objects.get(name=data['shift'])
    records = data['records']

    try:
        shift_attendance = ShiftAttendance.objects.create(location=location, shift=shift, date=data["date"],
                                                          created_by=user.employee_profile)
    except IntegrityError:
        return Response({"detail": _("تم تسجيل حضور هذه الوردية لهذا اليوم")}, status=status.HTTP_409_CONFLICT)

    for record in records:
        guard = SecurityGuard.objects.get(id=record)
        SecurityGuardAttendance.objects.create(security_guard=guard, shift=shift_attendance,
                                               status=records[record]["status"], notes=records[record].get("notes", ""))

    return Response(data={}, status=status.HTTP_201_CREATED)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_shift_attendance(request):
    date = request.query_params.get('date')
    location = request.query_params.get('location')
    shift = request.query_params.get('shift')

    shift_attendance = get_object_or_404(
        ShiftAttendance, date=date, location=location, shift__name=shift
    )

    guards = shift_attendance.security_guards.all()

    # Count attendance statuses
    status_counts = Counter(guard.status for guard in guards)

    # Build stats dict with default zeroes
    stats = [{"name": "الحضور", "value": status_counts.get("حاضر", 0), "color": "#4ade80"},
             {"name": "التأخير", "value": status_counts.get("متأخر", 0), "color": "#facc15"},
             {"name": "الغياب", "value": status_counts.get("غائب", 0), "color": "#f87171"}, ]

    # Build record list
    records = [
        {
            "status": guard.status,
            "notes": guard.notes,
            "name": guard.security_guard.name,
            "employee_id": guard.security_guard.employee_id,
        }
        for guard in guards
    ]

    data = {"stats": stats, "records": records,
            "created_at": shift_attendance.created_at.astimezone(settings.SAUDI_TZ).strftime("%Y-%m-%d   %I:%M%p")}

    return Response(data=data, status=status.HTTP_200_OK)
