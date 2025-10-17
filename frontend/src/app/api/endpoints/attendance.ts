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
        url: `/attendance/get-project-attendances/?${qs.stringify({
          is_active: "active",
          ...params,
        })}`,
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
    securityGuardAttendance: builder.mutation<
      void,
      { id: string; status: string }
    >({
      query: ({ id, status }) => ({
        url: `/attendance/security-guard-attendances/${id}/`,
        method: "PATCH",
        data: { status },
      }),
      invalidatesTags: [{ type: "ShiftAttendance", id: "LIST" }],
    }),
    getShiftAttendance: builder.query({
      query: (params) => ({
        url: `/attendance/get-shift-attendance/?${qs.stringify(params || {})}`,
        method: "GET",
      }),
      providesTags: [{ type: "ShiftAttendance", id: "LIST" }],
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
  useSecurityGuardAttendanceMutation,
  useGetShiftAttendanceQuery,
  useDeleteShiftAttendanceMutation,
} = attendanceEndpoints;
