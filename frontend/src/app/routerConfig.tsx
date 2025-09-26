import { RouteObject } from "react-router";
import appRoutes, { AppRoute } from "./appRoutes";
import VisitForm from "@/pages/visits/supervisor/VisitForm";
import ViolationForm from "@/pages/violations/supervisor/ViolationForm";
import VisitReportPage from "@/pages/visits/moderators/VisitReportPage";
import CreateVisitForm from "@/components/visits/moderators/CreateVisitForm";
import SecurityGuardForm from "@/pages/security-guards/SecurityGuardForm";
import SecurityGuardEdit from "@/pages/security-guards/SecurityGuardEdit";
import SecurityGuardProfile from "@/pages/security-guards/SecurityGuardProfile";

const alterRoute = function (
  appRoutes: AppRoute[],
  routePath: string,
  newRoute: RouteObject,
  parentPath?: string
): AppRoute[] {
  return appRoutes.map((route) => {
    const currentRoutePath = parentPath
      ? `${parentPath}/${route.path}`
      : route.path;

    if (currentRoutePath === routePath) {
      return { ...route, ...newRoute } as RouteObject;
    }

    if (route.children?.length) {
      return {
        ...route,
        children: alterRoute(
          route.children,
          routePath,
          newRoute,
          currentRoutePath
        ),
      };
    }

    return route;
  });
};

const addSubRoutes = (
  appRoutes: AppRoute[],
  subRoutes: { [key: string]: RouteObject[] },
  parentPath?: string
): AppRoute[] => {
  return appRoutes.map((route) => {
    const currentRoutePath = parentPath
      ? `${parentPath}/${route.path}`
      : route.path;

    const matchedChildren = subRoutes[currentRoutePath!];

    return {
      ...route,
      children: [
        ...(matchedChildren || []),
        ...(route.children
          ? addSubRoutes(route.children, subRoutes, currentRoutePath)
          : []),
      ],
    } as AppRoute;
  });
};

let routes: RouteObject[] = addSubRoutes(appRoutes, {
  "/supervisor/visits": [
    { path: "start-visit/:visit_id", element: <VisitForm /> },
  ],
  "/supervisor/violations": [
    { path: "report-violation", element: <ViolationForm /> },
  ],
  "/moderator/visits": [
    { path: "view-report/:report_id", element: <VisitReportPage /> },
    { path: "add-visit/", element: <CreateVisitForm /> },
  ],
  "/moderator/security-guards": [
    { path: "add/", element: <SecurityGuardForm /> },
    { path: "edit/:guard_id", element: <SecurityGuardEdit /> },
    { path: "guard-profile/:guard_id", element: <SecurityGuardProfile /> },
  ],
});

export default routes;
