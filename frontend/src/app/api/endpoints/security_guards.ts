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
    getSecurityGuard: builder.query<
      SecurityGuard,
      { id: string; format: "detailed" | "form_data" }
    >({
      query: ({ id, format }) => ({
        url: `/employees/security-guards/${id}/${format}/`,
        method: "GET",
      }),
      providesTags: (res, error, arg) => [
        { type: "SecurityGuard", id: arg.id },
      ],
    }),
    securityGuard: builder.mutation<
      SecurityGuard,
      { data: Partial<SecurityGuard>; method?: string; url?: string }
    >({
      query: ({ data, method, url }) => ({
        url: url || `employees/security-guards/`,
        method: method || "POST",
        data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          const response = (await queryFulfilled).data;
          // Invalidate the Security Guards LIST tag on successful POST
          dispatch(
            api.util.invalidateTags([
              { type: "SecurityGuard", id: "LIST" },
              { type: "SecurityGuard", id: response.id },
            ])
          );
        } catch {
          // Do nothing if the request fails
        }
      },
    }),
    switchGuardActive: builder.mutation<{ is_active: boolean }, string>({
      query: (id) => ({
        url: `/employees/security-guards/${id}/switch_active/`,
        method: "POST",
      }),
      invalidatesTags: [{ type: "SecurityGuard", id: "LIST" }],
    }),
  }),
});

export const {
  useGetSecurityGuardsQuery,
  useLazyGetSecurityGuardsQuery,
  useGetSecurityGuardQuery,
  useSecurityGuardMutation,
  useSwitchGuardActiveMutation,
} = securityGuardsEndpoints;
