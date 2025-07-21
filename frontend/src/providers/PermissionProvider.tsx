import NotAllowed from "@/pages/NotAllowed";
import { ENGLISH_ROLES } from "@/types/user";
import { Outlet } from "react-router";
import { useAuth } from "./AuthProvider";

const PermissionProvider = ({ role }: { role: ENGLISH_ROLES }) => {
  const user = useAuth().user;
  return user.role === role ? <Outlet /> : <NotAllowed />;
};

export default PermissionProvider;
