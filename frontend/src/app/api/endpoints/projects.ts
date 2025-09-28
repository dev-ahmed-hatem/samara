import { PaginatedResponse } from "@/types/paginatedResponse";
import api from "../apiSlice";
import { Project } from "@/types/project";
import qs from "query-string";
import { ProjectGuard } from "@/types/scurityGuard";
import { QueryParams } from "@/types/query_param";

export const projectsEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    getProjects: builder.query<
      PaginatedResponse<Project> | Project[],
      Record<string, any> | void
    >({
      query: (params) => ({
        url: `/projects/projects/?${qs.stringify({
          no_pagination: true,
          ...params,
        })}`,
        method: "GET",
      }),
      providesTags: (result) => {
        let array = Array.isArray(result) ? result : result?.data;
        return array
          ? [
              ...array.map((project) => ({
                type: "Project" as const,
                id: project.id,
              })),
              { type: "Project", id: "LIST" },
            ]
          : [{ type: "Project", id: "LIST" }];
      },
    }),
    getProject: builder.query<
      Project,
      { id: string; format: "detailed" | "form_data" }
    >({
      query: ({ id, format }) => ({
        url: `/projects/projects/${id}/${format}/`,
        method: "GET",
      }),
      providesTags: (res, error, arg) => [
        { type: "Project", id: parseInt(arg.id) },
      ],
    }),
    project: builder.mutation<
      Project,
      { data: Partial<Project>; method?: string; url?: string }
    >({
      query: ({ data, method, url }) => ({
        url: url || `/projects/projects/`,
        method: method || "POST",
        data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Invalidate the Employee LIST tag on successful POST
          dispatch(
            api.util.invalidateTags([
              { type: "Project", id: "LIST" },
              { type: "Project", id: arg.data.id },
            ])
          );
        } catch {
          // Do nothing if the request fails
        }
      },
    }),
    getProjectGuards: builder.query<
      PaginatedResponse<ProjectGuard>,
      QueryParams
    >({
      query: (params) => ({
        url: `/projects/project-guards/?${qs.stringify(params || {})}`,
        method: "GET",
      }),
      providesTags: [{ type: "ProjectGuard", id: "LIST" }],
    }),
  }),
});

export const {
  useGetProjectsQuery,
  useGetProjectQuery,
  useProjectMutation,
  useGetProjectGuardsQuery,
} = projectsEndpoints;
