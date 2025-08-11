import { useAppSelector } from "@/app/redux/hooks";
import SupervisorHome from "./SupervisorHome";
import ModeratorHome from "./ModeratorHome";
import AdminHome from "./AdminHome";

const Home = () => {
  const user = useAppSelector((state) => state.auth.user);
  return user?.role === "supervisor" ? (
    <SupervisorHome />
  ) : user?.role === "moderator" ? (
    <ModeratorHome />
  ) : (
    <AdminHome />
  );
};

export default Home;
