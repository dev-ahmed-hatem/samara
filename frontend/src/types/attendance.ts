export type ShiftType =
  | "الوردية الأولى"
  | "الوردية الثانية"
  | "الوردية الثالثة";

export type AttendanceStatus = "حاضر" | "متأخر" | "غائب";

export interface ShiftAttendance {
  id: number;
  location: {
    id: number;
    name: string;
  };
  shift_type: ShiftType;
  date: string;
  created_at: string;
}

export interface EmployeeAttendance {
  id: number;
  employee: string; // id
  shift: string; // id
  status: AttendanceStatus;
  notes?: string;
}
