import { User } from "@/types/user";
import { createSlice } from "@reduxjs/toolkit";

interface AuthState {
  user: User | null;
}

const initialState: AuthState = {
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    clearUser(state, action) {
      state.user = null;
    },
    setEmployeeProfile(state, action) {
      if (state.user && state.user.employee_profile) {
        state.user.employee_profile = action.payload;
      }
    },
  },
});

export const { setUser, setEmployeeProfile, clearUser } = authSlice.actions;
export default authSlice.reducer;
