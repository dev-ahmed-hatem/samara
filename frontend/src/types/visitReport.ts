export type EvaluationValue = "جيد" | "يحتاج إلى معالجة";

export type VisitReport = {
  id: number;
  visit: {
    id: number;
    location_name: string;
    project_name: string;
    employee: string;
  };
  guard_presence: EvaluationValue;
  guard_presence_notes?: string;
  guard_presence_attachment?: string;

  uniform_cleanliness: EvaluationValue;
  uniform_cleanliness_notes?: string;
  uniform_cleanliness_attachment?: string;

  attendance_records: EvaluationValue;
  attendance_records_notes?: string;
  attendance_records_attachment?: string;

  shift_handover: EvaluationValue;
  shift_handover_notes?: string;
  shift_handover_attachment?: string;

  lighting: EvaluationValue;
  lighting_notes?: string;
  lighting_attachment?: string;

  cameras: EvaluationValue;
  cameras_notes?: string;
  cameras_attachment?: string;

  security_vehicles: EvaluationValue;
  security_vehicles_notes?: string;
  security_vehicles_attachment?: string;

  radio_devices: EvaluationValue;
  radio_devices_notes?: string;
  radio_devices_attachment?: string;

  other: EvaluationValue;
  other_notes?: string;
  other_attachment?: string;

  client_notes?: string;
  supervisor_notes?: string;

  created_at: string;
};
