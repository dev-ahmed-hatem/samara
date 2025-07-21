import Base from "@/pages/Base";
import Error from "@/pages/ErrorPage";
import SectionView from "@/pages/SectionView";
import EmployeesList from "@/pages/employees/EmployeesList";
import ProjectsList from "@/pages/projects/ProjectsList";
import { FaUser, FaCalendarCheck, FaMoneyBill, FaFile } from "react-icons/fa";
import { FaDiagramProject, FaCalendarDays } from "react-icons/fa6";
import { GiReceiveMoney, GiPayMoney, GiMoneyStack } from "react-icons/gi";
import { LuNotebookPen } from "react-icons/lu";
import { MdAssignment } from "react-icons/md";
import { RouteObject } from "react-router";
import TasksList from "@/pages/tasks/TasksList";
import AttendancePage from "@/pages/attendance/AttendancePage";
import FinancialsPage from "@/pages/financials/FinancialsPage";
import FilesPage from "@/pages/files/FilesPage";
import SalariesPage from "@/pages/financials/Salaries";
import FinancialRecords from "@/pages/financials/FinancialRecords";
import NotesPage from "@/pages/notes/NotesPage";
import SchedulesPage from "@/pages/schedules/SchedulesPage";
import LoginPage from "@/pages/LoginPage";
import AuthProvider from "@/providers/AuthProvider";
import PermissionProvider from "@/providers/PermissionProvider";

export type AppRoute = RouteObject & {
  key?: string;
  label?: string;
  icon?: React.ReactNode;
  children?: AppRoute[];
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
    children: [
      {
        path: "/admin",
        element: <PermissionProvider role={"admin"} />,
        children: [
          {
            path: "",
            element: <>Admin</>,
          },
        ],
      },
      {
        path: "/sys_user",
        element: <PermissionProvider role="sys_user" />,
        children: [
          {
            path: "",
            element: <>sys user</>,
          },
        ],
      },
      {
        path: "/supervisor",
        element: <PermissionProvider role="supervisor" />,
        children: [
          {
            path: "",
            element: <>Supervisor</>,
          },
        ],
      },
      {
        path: "employees",
        element: (
          <SectionView
            parentComponent={<EmployeesList />}
            parentUrl="/employees"
          />
        ),
        icon: <FaUser />,
        label: "الموظفين",
      },
      {
        path: "projects",
        element: (
          <SectionView
            parentComponent={<ProjectsList />}
            parentUrl="/projects"
          />
        ),
        icon: <FaDiagramProject />,
        label: "المشاريع",
      },
      {
        path: "tasks",
        element: (
          <SectionView parentComponent={<TasksList />} parentUrl="/tasks" />
        ),
        icon: <MdAssignment />,
        label: "المهام",
      },
      {
        path: "attendance",
        element: <AttendancePage />,
        icon: <FaCalendarCheck />,
        label: "الحضور والانصراف",
      },
      {
        path: "financials",
        icon: <FaMoneyBill />,
        label: "الماليات",
        element: <FinancialsPage />,
        children: [
          {
            path: "incomes",
            element: <FinancialRecords financialItem="income" />,
            icon: <GiReceiveMoney />,
            label: "الإيرادات",
          },
          {
            path: "expenses",
            element: <FinancialRecords financialItem="expense" />,
            icon: <GiPayMoney />,
            label: "المصروفات",
          },
          {
            path: "salaries",
            element: <SalariesPage />,
            icon: <GiMoneyStack />,
            label: "الرواتب",
          },
        ],
      },
      {
        path: "schedules",
        element: <SchedulesPage />,
        icon: <FaCalendarDays />,
        label: "جدول المواعيد",
      },
      {
        path: "notes",
        element: <NotesPage />,
        icon: <LuNotebookPen />,
        label: "المذكرات",
      },
      {
        path: "files",
        element: <FilesPage />,
        icon: <FaFile />,
        label: "الملفات",
      },
    ],
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
