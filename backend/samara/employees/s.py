from .models import SecurityGuard, Shift, SecurityGuardLocationShift
from projects.models import Project, Location

import json

# 1493, 1781, 1672, 1828


with open('employees/samara_guards.json', 'r') as f:
    data = json.load(f)


for i in data:
    if len(data[i]["locations"]) == 1 and len(data[i]["shifts"]) == 1:
        guard = SecurityGuard.objects.get(employee_id=i)
        location = Location.objects.get(id=data[i]["locations"][0])
        shift = Shift.objects.get(id=data[i]["shifts"][0])

        SecurityGuardLocationShift.objects.create(guard=guard, location=location, shift=shift)

