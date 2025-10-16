import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";

export const api = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  endpoints: () => ({}),
  tagTypes: [
    "Employee",
    "Visit",
    "Project",
    "ProjectGuard",
    "ProjectAttendances",
    "Location",
    "SecurityGuard",
    "SecurityGuardShifts",
    "ShiftAttendance",
    "Violation",
    "MonthlyRecord",
    "DailyRecord",
    "Users",
  ],
  keepUnusedDataFor: 180,
  refetchOnReconnect: true,
});

export default api;
