import { useEffect, useState } from "react";
import Navbar from "../components/navbar/Navbar";
import Menu from "../components/Menu";
import { Navigate, Outlet, useLocation } from "react-router";
import Footer from "../components/Footer";
import ScrollToTop from "../components/ScrollToTop";
import Error from "./ErrorPage";
import { useAppSelector } from "@/app/redux/hooks";
import Loading from "@/components/Loading";

const Base = ({ error }: { error?: any }) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const user = useAppSelector((state) => state.auth.user)!;
  const [redirected, setRedirected] = useState(false);
  const location = useLocation();

  // Handle redirect only once when needed
  useEffect(() => {
    if (user && location.pathname === "/") {
      setRedirected(true);
    }
  }, [user, location.pathname]);

  // Show loading if user is not ready
  if (!user) {
    return <Loading />;
  }

  // Show error page if error prop is passed
  if (error) {
    return <Error notFound={true} />;
  }

  // Redirect based on role from root
  if (redirected && location.pathname === "/") {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return (
    <div>
      <ScrollToTop />
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Menu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <main className="min-h-screen">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Base;
