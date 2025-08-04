import { ViolationForm, Visit, VisitReportForm } from "@/types/visit";
import api from "../apiSlice";
import qs from "query-string";

export const visitsEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getVisits: builder.query<Visit[], Record<string, any>>({
      query: (params) => ({
        url: `/visits/visits?${qs.stringify({
          no_pagination: true,
          ...params,
        })}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((visit) => ({
                type: "Visit" as const,
                id: visit.id,
              })),
              { type: "Visit", id: "LIST" },
            ]
          : [{ type: "Visit", id: "LIST" }],
    }),
    visit: builder.query<Visit, string>({
      query: (id) => ({
        url: `/visits/visits/${id}/`,
        method: "GET",
      }),
      providesTags: (response, error, id) => [{ type: "Visit", id }],
    }),
    visitReport: builder.mutation<void, VisitReportForm & { visit: string }>({
      query: (data) => ({
        url: `/visits/visit-report/`,
        method: "POST",
        data,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Visit", id: arg.visit },
      ],
    }),
    violation: builder.mutation<void, ViolationForm & { visit: string }>({
      query: (data) => ({
        url: `/visits/violations/`,
        method: "POST",
        data,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Visit", id: arg.visit },
      ],
    }),
  }),
});

export const {
  useGetVisitsQuery,
  useLazyGetVisitsQuery,
  useVisitReportMutation,
  useViolationMutation,
  useVisitQuery,
} = visitsEndpoints;
