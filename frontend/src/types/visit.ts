export type VisitStatus = "مجدولة" | "مكتملة";

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
