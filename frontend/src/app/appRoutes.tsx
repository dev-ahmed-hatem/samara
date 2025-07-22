import Base from "@/pages/Base";
import Error from "@/pages/ErrorPage";
import { RouteObject } from "react-router";
import LoginPage from "@/pages/LoginPage";
import AuthProvider from "@/providers/AuthProvider";
import PermissionProvider from "@/providers/PermissionProvider";
import VisitsPage from "@/pages/visits/supervisor/Visits";

export type AppRoute = RouteObject & {
  key?: string;
  label?: string;
  icon?: React.ReactNode;
  children?: AppRoute[];
};

export const routesMap = {
  admin: {
    path: "/admin",
    element: <PermissionProvider role={"admin"} />,
    children: [
      {
        path: "",
        element: <>Admin</>,
      },
    ],
  },
  sys_user: {
    path: "/sys_user",
    element: <PermissionProvider role="sys_user" />,
    children: [
      {
        path: "",
        element: <>sys user</>,
      },
    ],
  },
  supervisor: {
    path: "/supervisor",
    element: <PermissionProvider role="supervisor" />,
    children: [
      {
        label: "الزيارات",
        path: "visits",
        element: <VisitsPage />,
      },
    ],
  },
};

export const appRoutes: AppRoute[] = [
  {
    path: "",
    element: (
      <AuthProvider>
        <Base />
      </AuthProvider>
    ),
    errorElement: <Base error={true} />,
    children: Object.values(routesMap),
  },
  {
    path: "login",
    element: <LoginPage />,
  },
  {
    path: "*",
    element: <Error notFound={true} />,
  },
];

export default appRoutes;
