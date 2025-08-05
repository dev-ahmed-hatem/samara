import { ViolationForm, Visit, VisitReportForm } from "@/types/visit";
import api from "../apiSlice";
import qs from "query-string";
import { Violation } from "@/types/violation";

export const visitsEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    // visits queries
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

    // violations queries
    getViolations: builder.query<Violation[], Record<string, any>>({
      query: (params) => ({
        url: `/visits/violations?${qs.stringify({
          no_pagination: true,
          ...params,
        })}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((violation) => ({
                type: "Violation" as const,
                id: violation.id,
              })),
              { type: "Violation", id: "LIST" },
            ]
          : [{ type: "Violation", id: "LIST" }],
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
  useLazyGetViolationsQuery,
  useVisitReportMutation,
  useViolationMutation,
  useVisitQuery,
} = visitsEndpoints;
