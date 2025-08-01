import qs from "query-string";
import api from "../apiSlice";

export const attendanceEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
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

export const { useShiftAttendanceMutation, useLazyGetShiftAttendanceQuery } = attendanceEndpoints;
