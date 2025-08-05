from projects.models import Location
from employees.models import Shift, SecurityGuard
from django.db.utils import IntegrityError

import pandas as pd

# Load the Excel file
df = pd.read_excel('./employees/sheet.xlsx')  # Replace with your actual file path

# Rename columns for consistency (optional)
df.columns = ['index', 'name', 'employee_id', 'project_name', 'location', 'shift']

# Drop the index column if it's not needed
df = df.drop(columns=['index'])

# Convert to list of dictionaries (optional, useful for further processing)
guards_data = df.to_dict(orient='records')

guards_data.pop(0)

guards_data = [row for row in guards_data if not all(pd.isna(v) for v in row.values())]

# exclude "راحات"
guards_data = [row for row in guards_data if row.get("shift") != "راحات"]

sections = {
    "ول": "الوردية الأولى",
    "ثان": "الوردية الثانية",
    "ثال": "الوردية الثالثة",
}


def match_shift(guard_shift: str) -> str | None:
    for key, full_shift in sections.items():
        if key in guard_shift:
            return full_shift
    return None  # No match


for guard in guards_data:
    location = Location.objects.get(name=guard["location"].strip(), project__name=guard["project_name"].strip())
    shift = Shift.objects.get(name=match_shift(guard["shift"]))

    try:
        SecurityGuard.objects.create(name=guard["name"], employee_id=guard["employee_id"], location=location,
                                     shift=shift)

    except IntegrityError:
        print(guard["employee_id"])

    # print(guard["project_name"], guard["location"])
