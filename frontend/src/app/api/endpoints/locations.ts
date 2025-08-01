import { PaginatedResponse } from "@/types/paginatedResponse";
import { Location } from "@/types/location";
import api from "../apiSlice";
import qs from "query-string";

export const locationsEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getLocations: builder.query<Location[], Record<string, any> | void>({
      query: (params) => ({
        url: `/projects/locations/?${qs.stringify({
          no_pagination: true,
          ...params,
        })}`,
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.map((location) => ({
                type: "Location" as const,
                id: location.id,
              })),
              { type: "Location", id: "LIST" },
            ]
          : [{ type: "Location", id: "LIST" }],
    }),

    // getProject: builder.query<
    //   Project,
    //   { id: string; format: "detailed" | "form_data" }
    // >({
    //   query: ({ id, format }) => ({
    //     url: `/projects/projects/${id}/${format}/`,
    //     method: "GET",
    //   }),
    //   providesTags: (res, error, arg) => [{ type: "Project", id: arg.id }],
    // }),
    // switchProjectStatus: builder.mutation<
    //   { status: ProjectStatus },
    //   { id: string; status: string }
    // >({
    //   query: ({ id, status }) => ({
    //     url: `/projects/projects/${id}/change_status/`,
    //     method: "POST",
    //     data: { status },
    //   }),
    //   invalidatesTags: [{ type: "Project", id: "LIST" }],
    // }),
    // project: builder.mutation<
    //   Project,
    //   { data: Partial<Project>; method?: string; url?: string }
    // >({
    //   query: ({ data, method, url }) => ({
    //     url: url || `projects/projects/`,
    //     method: method || "POST",
    //     data,
    //   }),
    //   async onQueryStarted(arg, { dispatch, queryFulfilled }) {
    //     try {
    //       await queryFulfilled;
    //       // Invalidate the Employee LIST tag on successful POST
    //       dispatch(
    //         api.util.invalidateTags([
    //           { type: "Project", id: "LIST" },
    //           { type: "Project", id: arg.data.id },
    //         ])
    //       );
    //     } catch {
    //       // Do nothing if the request fails
    //     }
    //   },
    // }),
    // deleteProject: builder.mutation<void, string>({
    //   query: (id) => ({
    //     url: `/projects/projects/${id}/`,
    //     method: "DELETE",
    //   }),
    //   invalidatesTags: [{ type: "Project", id: "LIST" }],
    // }),
  }),
});

export const { useGetLocationsQuery, useLazyGetLocationsQuery } =
  locationsEndpoints;
