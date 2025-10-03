import api from "../apiSlice";
import qs from "query-string";
import { Employee } from "@/types/employee";
import { PaginatedResponse } from "@/types/paginatedResponse";
import { QueryParams } from "@/types/query_param";
import { MonthRecord, Visit } from "@/types/visit";
import { Violation } from "@/types/violation";
import { HomeStats, ModeratorHomeStats } from "@/types/homeStat";

export const employeesEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getSupervisorHomeStats: builder.query<HomeStats, void>({
      query: () => ({
        url: "/employees/get-supervisor-home-stats/",
        method: "GET",
      }),
    }),
    getModeratorHomeStats: builder.query<ModeratorHomeStats, void>({
      query: () => ({
        url: "/employees/get-moderator-home-stats/",
        method: "GET",
      }),
    }),
    getEmployees: builder.query<
      PaginatedResponse<Employee> | Employee[],
      QueryParams
    >({
      query: (params) => ({
        url: `/employees/employees?${qs.stringify(params || {})}`,
        method: "GET",
      }),
      providesTags: (result) => {
        let array = Array.isArray(result) ? result : result?.data;
        return array
          ? [
              ...array.map((employee) => ({
                type: "Employee" as const,
                id: employee.id,
              })),
              { type: "Employee", id: "LIST" },
            ]
          : [{ type: "Employee", id: "LIST" }];
      },
    }),
    getSupervisorMonthlyRecord: builder.query<
      { month: string; data: Record<string, MonthRecord> },
      { date: string; supervisor: string; period: "morning" | "evening" }
    >({
      query: (params) => ({
        url: `/employees/supervisor-monthly-records/?${qs.stringify(params)}`,
        method: "GET",
      }),
      providesTags: [{ type: "MonthlyRecord", id: "LIST" }],
    }),
    getSupervisorDailyRecord: builder.query<
      { visits: Visit[]; violations: Violation[] },
      { date: string; supervisor: string; period: "morning" | "evening" }
    >({
      query: (params) => ({
        url: `/employees/supervisor-daily-records/?${qs.stringify(params)}`,
        method: "GET",
      }),
      providesTags: [{ type: "DailyRecord", id: "LIST" }],
    }),
    employee: builder.mutation<
      Employee,
      {
        data?: Partial<Employee> & { file: File | string | null };
        method?: string;
        url?: string;
      }
    >({
      query: ({ data, method, url }) => ({
        url: url || `employees/employees/`,
        method: method || "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Invalidate the Employee LIST tag on successful POST
          dispatch(
            api.util.invalidateTags([
              { type: "Employee", id: "LIST" },
              { type: "Employee", id: arg.data?.id },
            ])
          );
        } catch {
          // Do nothing if the request fails
        }
      },
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetSupervisorHomeStatsQuery,
  useGetModeratorHomeStatsQuery,
  useGetEmployeesQuery,
  useEmployeeMutation,
  useLazyGetSupervisorMonthlyRecordQuery,
  useLazyGetSupervisorDailyRecordQuery,
} = employeesEndpoints;
