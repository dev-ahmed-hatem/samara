import { useState } from "react";
import Navbar from "../components/navbar/Navbar";
import Menu from "../components/Menu";
import { Navigate, Outlet, useMatch } from "react-router";
import Home from "./Home";
import Footer from "../components/Footer";
import Breadcrumbs from "../components/BreadCrumbs";
import ScrollToTop from "../components/ScrollToTop";
import Error from "./ErrorPage";
import { useAppSelector } from "@/app/redux/hooks";

const Base = ({ error }: { error?: any }) => {
  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const isHome = useMatch("/");
  const user = useAppSelector((state) => state.auth.user)!;

  return (
    <>
      <ScrollToTop />
      <Navbar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Menu menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      {error ? (
        // error display
        <Error />
      ) : isHome ? (
        // home page
        <Navigate to={user.role} />
      ) : (
        // nested routes
        <div className="padding-container py-7">
          <Breadcrumbs />
          <Outlet />
        </div>
      )}
      <Footer />
    </>
  );
};

export default Base;
