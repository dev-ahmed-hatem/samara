import Base from "@/pages/Base";
import Error from "@/pages/ErrorPage";
import { RouteObject } from "react-router";
import LoginPage from "@/pages/LoginPage";
import AuthProvider from "@/providers/AuthProvider";
import PermissionProvider from "@/providers/PermissionProvider";
import SectionView from "@/pages/SectionView";
import VisitsList from "@/pages/visits/supervisor/visits/VisitsList";
import { CalendarOutlined } from "@ant-design/icons";

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
        icon: <CalendarOutlined />,
        element: (
          <SectionView
            parentComponent={<VisitsList />}
            parentUrl="/supervisor/visits"
          />
        ),
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
