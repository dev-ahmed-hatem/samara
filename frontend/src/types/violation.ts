export type Violation = {
  id: number;
  location: number; // Assuming you're sending the `location.id`
  location_name: string;
  project_name: string;
  violation_type:
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
  severity: "منخفضة" | "متوسطة" | "عالية";
  details: string;
  supervisor_explanation?: string;
  violation_image?: string; // URL if returned in GET
  action?: string;
  guidance?: string;
  penalty?: string;
  confirmed_by_ops: boolean;
  confirmed_by_monitoring: boolean;
  created_at: string; // ISO date string
  created_by: number; // or { id: number; name: string; ... } if populated
};
