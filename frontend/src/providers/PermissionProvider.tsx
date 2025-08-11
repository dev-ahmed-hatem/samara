import NotAllowed from "@/pages/NotAllowed";
import { ENGLISH_ROLES } from "@/types/user";
import { Outlet, useMatch } from "react-router";
import { useAuth } from "./AuthProvider";
import Home from "@/pages/home/Home";
import Breadcrumbs from "@/components/BreadCrumbs";

const PermissionProvider = ({ role }: { role: ENGLISH_ROLES }) => {
  const user = useAuth().user;
  const isHome = useMatch(`/${user.role}`);
  return user.role !== role ? (
    <NotAllowed />
  ) : (
    <div className="padding-container pt-10">
      {isHome ? (
        <Home />
      ) : (
        <>
          <Breadcrumbs />
          <Outlet />
        </>
      )}
    </div>
  );
};

export default PermissionProvider;
