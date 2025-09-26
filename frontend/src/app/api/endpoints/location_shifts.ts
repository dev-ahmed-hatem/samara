import api from "../apiSlice";
import { SecurityGuard } from "@/types/scurityGuard";
import { ShiftType } from "@/types/attendance";

export const locationShiftsEndpoints = api.injectEndpoints({
  endpoints: (builder) => ({
    locationShift: builder.mutation<
      SecurityGuard,
      {
        data?: Partial<{ location: string; guard: string; shift: ShiftType }>;
        method?: string;
        url?: string;
      }
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
              { type: "SecurityGuardShifts", id: "LIST" },
            ])
          );
        } catch {
          // Do nothing if the request fails
        }
      },
    }),
  }),
});

export const { useLocationShiftMutation } = locationShiftsEndpoints;
