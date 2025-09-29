import Base from "@/pages/Base";
import Error from "@/pages/ErrorPage";
import { RouteObject } from "react-router";
import LoginPage from "@/pages/LoginPage";
import AuthProvider from "@/providers/AuthProvider";
import PermissionProvider from "@/providers/PermissionProvider";
import SectionView from "@/pages/SectionView";
import VisitsList from "@/pages/visits/supervisor/VisitsList";
import AttendancePage from "@/pages/attendance/supervisors/AttendancePage";
import {
  CalendarOutlined,
  IdcardOutlined,
  ProjectOutlined,
  SettingOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { BsFillPersonCheckFill } from "react-icons/bs";
import ViolationsList from "@/pages/violations/supervisor/ViolationsList";
import VisitsController from "@/pages/visits/moderators/VisitsController";
import AttendanceReports from "@/pages/attendance/moderators/AttendanceReports";
import SecurityGuardsList from "@/pages/security-guards/SecurityGuardsList";
import ProjectsList from "@/pages/projects/ProjectsList";
import SettingsPage from "@/pages/Settings";

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
  moderator: {
    path: "/moderator",
    element: <PermissionProvider role="moderator" />,
    children: [
      {
        path: "security-guards",
        label: "رجال الأمن",
        icon: <IdcardOutlined />,
        element: (
          <SectionView
            parentComponent={<SecurityGuardsList />}
            parentUrl="/moderator/security-guards"
          />
        ),
      },
      {
        path: "projects",
        label: "المشروعات والمواقع",
        icon: <ProjectOutlined />,
        element: (
          <SectionView
            parentComponent={<ProjectsList />}
            parentUrl="/moderator/projects"
          />
        ),
      },
      {
        path: "visits",
        label: "سجل الزيارات والمخالفات",
        icon: <CalendarOutlined />,
        element: (
          <SectionView
            parentComponent={<VisitsController />}
            parentUrl="/moderator/visits"
          />
        ),
      },
      {
        label: "تسجيلات حضور رجال الأمن",
        path: "attendance",
        icon: <BsFillPersonCheckFill />,
        element: <AttendanceReports />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
        icon: <SettingOutlined />,
        label: "الإعدادات",
      },
    ],
  },
  supervisor: {
    path: "/supervisor",
    element: <PermissionProvider role="supervisor" />,
    children: [
      {
        label: "جدول الزيارات الميدانية",
        path: "visits",
        icon: <CalendarOutlined />,
        element: (
          <SectionView
            parentComponent={<VisitsList />}
            parentUrl="/supervisor/visits"
          />
        ),
      },
      {
        label: "سجل المخالفات",
        path: "violations",
        icon: <WarningOutlined />,
        element: (
          <SectionView
            parentComponent={<ViolationsList />}
            parentUrl="/supervisor/violations"
          />
        ),
      },
      {
        label: "التحضير اليومي لرجال الأمن",
        path: "attendance",
        icon: <BsFillPersonCheckFill />,
        element: <AttendancePage />,
      },
      {
        path: "settings",
        element: <SettingsPage />,
        icon: <SettingOutlined />,
        label: "الإعدادات",
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
