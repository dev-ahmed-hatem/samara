type VisitPeriodStats = {
  morning: number;
  evening: number;
};

type DayStats = {
  scheduled: VisitPeriodStats;
  completed: VisitPeriodStats;
  violations: number;
  attendance_records: number;
};

export type HomeStats = {
  general: {
    projects_count: number;
    locations_count: number;
    guards_count: number;
  };
  today: DayStats;
  yesterday: DayStats;
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
    security_guards_count: { active: number; inactive: number };
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
