import { createApi } from "@reduxjs/toolkit/query/react";
import { axiosBaseQuery } from "./axiosBaseQuery";

export const api = createApi({
  reducerPath: "api",
  baseQuery: axiosBaseQuery(),
  endpoints: () => ({}),
  tagTypes: ["Visit", "Project", "Location", "SecurityGuard"],
  keepUnusedDataFor: 180,
  refetchOnReconnect: true,
});

export default api;
