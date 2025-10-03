import api from "../apiSlice";
import qs from "query-string";
import { QueryParams } from "@/types/query_param";
import { User } from "@/types/user";

export const usersEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getUsers: builder.query<User[], QueryParams>({
      query: (params) => ({
        url: `/users/users?${qs.stringify({ ...params })}`,
        method: "GET",
      }),
      providesTags: (result) => {
        return result
          ? [
              ...result.map((user) => ({
                type: "Users" as const,
                id: user.id,
              })),
              { type: "Users", id: "LIST" },
            ]
          : [{ type: "Users", id: "LIST" }];
      },
    }),
    user: builder.mutation<
      User,
      {
        data?: Partial<User>;
        method?: string;
        url?: string;
      }
    >({
      query: ({ data, method, url }) => ({
        url: url || `/users/users/`,
        method: method || "POST",
        data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Invalidate the Users LIST tag on successful POST
          dispatch(
            api.util.invalidateTags([
              { type: "Users", id: "LIST" },
              { type: "Users", id: arg.data?.id },
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

export const { useGetUsersQuery, useUserMutation } = usersEndpoints;
