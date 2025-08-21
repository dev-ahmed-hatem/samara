export type HomeStats = {
  project_count: number;
  location_count: number;
  scheduled_visits: number;
  completed_visits: number;
  violations: number;
  attendance_records: number;
  guards_count: number;
};

type VisitSummary = {
  total: number;
  completed: number;
  scheduled: number;
};

export type SupervisorSummary = {
  id: number;
  name: string;
  morning: VisitSummary;
  evening: VisitSummary;
};

type PieStat = { name: string; value: number; color: string };

export type ModeratorHomeStats = {
  general: {
    projects_count: number;
    locations_count: number;
    security_guards_count: number;
    supervisors_count: number;
  };
  today_visits: {
    morning: VisitSummary;
    evening: VisitSummary;
  };
  supervisors: SupervisorSummary[];
  attendance: PieStat[];
  shifts: PieStat[];
  shifts_count: number;
};
