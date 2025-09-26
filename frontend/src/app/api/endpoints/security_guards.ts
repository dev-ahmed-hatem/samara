import { PaginatedResponse } from "@/types/paginatedResponse";
import api from "../apiSlice";
import qs from "query-string";
import { SecurityGuard } from "@/types/scurityGuard";

export const securityGuardsEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getSecurityGuards: builder.query<
      PaginatedResponse<SecurityGuard> | SecurityGuard[],
      Record<string, any> | void
    >({
      query: (params) => ({
        url: `/employees/security-guards/?${qs.stringify({
          no_pagination: true,
          ...params,
        })}`,
        method: "GET",
      }),
      providesTags: (result) => {
        let array = Array.isArray(result) ? result : result?.data;
        return array
          ? [
              ...array.map((guard) => ({
                type: "SecurityGuard" as const,
                id: guard.id,
              })),
              { type: "SecurityGuard", id: "LIST" },
            ]
          : [{ type: "SecurityGuard", id: "LIST" }];
      },
    }),
  }),
});

export const { useGetSecurityGuardsQuery, useLazyGetSecurityGuardsQuery } =
  securityGuardsEndpoints;
