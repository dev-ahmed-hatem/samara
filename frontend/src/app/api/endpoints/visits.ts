import { ViolationForm, Visit, VisitReportForm } from "@/types/visit";
import api from "../apiSlice";
import qs from "query-string";
import { Violation } from "@/types/violation";
import { VisitReport } from "@/types/visitReport";

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
    getVisit: builder.query<Visit, string>({
      query: (id) => ({
        url: `/visits/visits/${id}/`,
        method: "GET",
      }),
      providesTags: (response, error, id) => [{ type: "Visit", id }],
    }),
    visit: builder.mutation<
      Visit,
      { url?: string; method?: string; data?: Record<string, any> }
    >({
      query: ({ url, method, data }) => ({
        url: url ?? `/visits/visits/`,
        method: method ?? "POST",
        data,
      }),
    }),
    visitReport: builder.mutation<void, VisitReportForm & { visit: string }>({
      query: (data) => ({
        url: `/visits/visit-reports/`,
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
    getViolation: builder.query<Violation, string>({
      query: (id) => ({
        url: `/visits/violations/${id}/`,
        method: "GET",
      }),
      providesTags: (response, error, id) => [{ type: "Violation", id }],
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
        { type: "Violation", id: arg.visit },
      ],
    }),
    deleteViolation: builder.mutation<void, string>({
      query: (id) => ({
        url: `/visits/visits/${id}`,
        method: "DELETE",
      }),
    }),
    getVisitReport: builder.query<VisitReport, string>({
      query: (id) => ({ url: `/visits/visit-reports/${id}/?`, method: "GET" }),
    }),
  }),
});

export const {
  useGetVisitsQuery,
  useLazyGetVisitsQuery,
  useLazyGetViolationsQuery,
  useVisitReportMutation,
  useViolationMutation,
  useGetVisitReportQuery,
  useGetVisitQuery,
  useVisitMutation,
  useDeleteViolationMutation,
  useGetViolationQuery,
} = visitsEndpoints;
