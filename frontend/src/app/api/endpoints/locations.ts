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
    location: builder.mutation<
      Location,
      {
        data?: Partial<Location> & { project?: string };
        method?: string;
        url?: string;
      }
    >({
      query: ({ data, method, url }) => ({
        url: url || `/projects/locations/`,
        method: method || "POST",
        data,
      }),
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
          // Invalidate the Employee LIST tag on successful POST
          dispatch(
            api.util.invalidateTags([
              { type: "Location", id: "LIST" },
              { type: "Location", id: arg?.data?.id },
            ])
          );
        } catch {
          // Do nothing if the request fails
        }
      },
    }),
  }),
});

export const {
  useGetLocationsQuery,
  useLazyGetLocationsQuery,
  useLocationMutation,
} = locationsEndpoints;
