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
      providesTags: [{ type: "ProjectAttendances", id: "LIST" }],
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
    deleteShiftAttendance: builder.mutation<void, number>({
      query: (shift_id) => ({
        url: `/attendance/shift-attendances/${shift_id}/`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "ProjectAttendances", id: "LIST" }],
    }),
  }),
});

export const {
  useLazyGetProjectAttendancesQuery,
  useShiftAttendanceMutation,
  useLazyGetShiftAttendanceQuery,
  useGetShiftAttendanceQuery,
  useDeleteShiftAttendanceMutation,
} = attendanceEndpoints;
