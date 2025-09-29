import { User } from "@/types/user";
import api from "../apiSlice";
import { ChangePasswordFields } from "@/components/settings/account/ChangePassword";

const auth = api.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<
      { access: string; refresh: string },
      { username: string; password: string }
    >({
      query: (data) => ({
        url: "/auth/login/",
        method: "POST",
        data,
      }),
    }),
    refresh: builder.mutation({
      query: () => ({
        url: "/auth/refresh/",
        method: "POST",
      }),
    }),
    verify: builder.mutation<void, { token: string }>({
      query: (data) => ({
        url: "/auth/verify/",
        method: "Get",
        data,
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: "/auth/logout/",
        method: "POST",
      }),
    }),
    getAuthUser: builder.query<User, void>({
      query: () => ({ url: "/auth/authenticated-user/", method: "GET" }),
    }),
    changePassword: builder.mutation<void, ChangePasswordFields>({
      query: (data) => ({
        url: "/users/change-password/",
        method: "PATCH",
        data,
      }),
    }),
  }),
  overrideExisting: false,
});

export const {
  useLoginMutation,
  useRefreshMutation,
  useVerifyMutation,
  useLogoutMutation,
  useGetAuthUserQuery,
  useChangePasswordMutation,
} = auth;
