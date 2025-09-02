import qs from "query-string";
import api from "../apiSlice";
import { LocationAttendance } from "@/types/attendance";

export const attendanceEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getProjectAttendances: builder.query<
      { project: string; date: string; attendances: LocationAttendance[] },
      { project: string; date: string }
    >({
      query: (params) => ({
        url: `/attendance/get-project-attendances/?${qs.stringify(
          params || {}
        )}`,
        method: "GET",
      }),
    }),
    shiftAttendance: builder.mutation({
      query: (data) => ({
        url: "/attendance/record-shift-attendance/?",
        method: "POST",
        data,
      }),
    }),
    getShiftAttendance: builder.query({
      query: (params) => ({
        url: `/attendance/get-shift-attendance/?${qs.stringify(params || {})}`,
        method: "GET",
      }),
    }),
  }),
});

export const {
  useLazyGetProjectAttendancesQuery,
  useShiftAttendanceMutation,
  useLazyGetShiftAttendanceQuery,
  useGetShiftAttendanceQuery
} = attendanceEndpoints;
