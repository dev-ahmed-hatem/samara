import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import { useGetAuthUserQuery } from "@/app/api/endpoints/auth";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { setUser } from "@/app/slices/authSlice";
import Loading from "@/components/Loading";
import Base from "@/pages/Base";
import ErrorPage from "@/pages/ErrorPage";
import { User } from "@/types/user";
import { AxiosError } from "axios";
import React, { createContext, useContext, useEffect } from "react";
import { Navigate, useLocation } from "react-router";

interface ContextType {
  user: User; // in case passing user as a context value
}

const AuthContext = createContext<ContextType | null>(null);

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  const dispatch = useAppDispatch();
  const { data, isFetching, isError, error, isSuccess } = useGetAuthUserQuery();

  useEffect(() => {
    if (isSuccess) {
      dispatch(setUser(data));
    }
  }, [isSuccess]);

  // check if user data has been saved in the store
  const user = useAppSelector((state) => state.auth.user);

  if (isFetching || !user) return <Loading />;
  if (isError) {
    const err = error as axiosBaseQueryError & AxiosError;
    const next =
      location.pathname !== "/"
        ? `/login?next=${encodeURIComponent(
            location.pathname + location.search
          )}`
        : `/login`;

    return err?.status == 401 ? (
      <Navigate to={next} />
    ) : err?.response ? (
      <Base error={true} />
    ) : (
      <ErrorPage />
    );
  }
  return (
    <AuthContext.Provider value={{ user: data! }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;

export const useAuth = (): ContextType => {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("user must login first");
  }
  return context;
};
