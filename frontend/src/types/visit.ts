export type VisitStatus = "مجدولة" | "مكتملة";
import type { RcFile } from "antd/es/upload/interface";

export interface Visit {
  id: string;
  location: {
    id: number;
    name: string;
    project_name: string;
  };
  date: string;
  time: string;
  employee: {
    id: number;
    name: string;
  };
  purpose: string;
  status: VisitStatus;
  completed_at: string | null;
  violation: string | null;
  report_id: string | null;

  opened?: boolean;
  // gps_coordinates?: { lat: number; lng: number }; // if you enable GIS field later
}

export const visitReportFieldLabels: Record<string, string> = {
  guard_presence: "تواجد الحارس في موقعه",
  uniform_cleanliness: "نظافة الزي الرسمي",
  attendance_records: "سجلات الحضور والانصراف والسجلات الخاصة بالموقع",
  shift_handover: "الانضباط في تسليم واستلام الورديات",
  lighting: "الإضاءة حول محيط الموقع",
  cameras: "كاميرات المراقبة",
  security_vehicles: "السيارات الأمنية",
  radio_devices: "عمل أجهزة الاتصال اللاسلكي",
  other: "اخرى",
};

export type VisitReportForm = {
  guard_presence: "جيد" | "يحتاج إلى معالجة";
  uniform_cleanliness: "جيد" | "يحتاج إلى معالجة";
  attendance_records: "جيد" | "يحتاج إلى معالجة";
  shift_handover: "جيد" | "يحتاج إلى معالجة";
  lighting: "جيد" | "يحتاج إلى معالجة";
  cameras: "جيد" | "يحتاج إلى معالجة";
  security_vehicles: "جيد" | "يحتاج إلى معالجة";
  radio_devices: "جيد" | "يحتاج إلى معالجة";
  notes?: string;
  attachment?: RcFile;
};

export type Severity = "منخفضة" | "متوسطة" | "عالية";

export type ViolationType =
  | "تأخير عن الدوام"
  | "التدخين بالموقع أثناء العمل"
  | "عدم الالتزام بالزي الرسمي"
  | "غياب"
  | "ترك الموقع (انسحاب)"
  | "التجمع في منطقة العمل"
  | "الشكوى من العميل"
  | "عدم احترام الرئيس المباشر"
  | "استخدام الجوال أثناء العمل"
  | "أخرى";

export type ViolationForm = {
  location: string;

  violation_type: ViolationType;

  severity: Severity;

  details: string;

  supervisor_explanation?: string;

  violation_image?: File | null;

  action?: string;

  guidance?: string;

  penalty?: string;

  confirmed_by_ops?: boolean;

  confirmed_by_monitoring?: boolean;
};

export type MonthRecord = {
  scheduled?: number;
  completed?: number;
  violations: number;
};
