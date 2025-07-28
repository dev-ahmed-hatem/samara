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
