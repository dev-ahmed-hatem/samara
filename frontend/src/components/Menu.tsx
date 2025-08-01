import { Drawer, Menu as AntdMenu } from "antd";
import Logo from "./Logo";
import "../styles/menu.css";
import { NavLink, useLocation } from "react-router";
import { useEffect, useMemo, useState } from "react";
import { routesMap, type AppRoute } from "../app/appRoutes";
import { ItemType } from "antd/es/menu/interface";
import { useAppSelector } from "@/app/redux/hooks";

const mapRoute = ({
  path,
  label,
  icon,
  children,
  fullPath,
}: AppRoute & { fullPath: string }): ItemType => {
  const currentPath = fullPath ? `${fullPath}/${path}` : path;

  return {
    key: currentPath!,
    icon,
    label:
      children && children?.length > 0 ? (
        label
      ) : (
        <NavLink to={currentPath!}>{label}</NavLink>
      ),
    children: children?.length
      ? children.map((subRoute) =>
          mapRoute({
            ...subRoute,
            fullPath: currentPath!,
          })
        )
      : undefined,
  };
};

const Menu = ({
  menuOpen,
  setMenuOpen,
}: {
  menuOpen: boolean;
  setMenuOpen: Function;
}) => {
  const onClose = () => {
    setMenuOpen(false);
  };
  const location = useLocation();
  const [openKeys, setOpenKeys] = useState<string[]>([]);

  const user = useAppSelector((state) => state.auth.user);

  const items = useMemo(() => {
    return routesMap[user!.role].children!.map((route) =>
      mapRoute({ ...route, fullPath: `/${user?.role}` })
    );
  }, []);

  useEffect(() => {
    const activeSubMenu = items!.find((item: any) =>
      item!.children?.some((child: any) => child.key === location.pathname)
    );
    setOpenKeys(activeSubMenu ? [activeSubMenu.key as string] : []);
  }, [location.pathname]);

  useEffect(() => {
    setTimeout(() => {
      document.querySelector(`.ant-menu-item-selected`)?.scrollIntoView();
    }, 200);
  }, [menuOpen]);

  return (
    <>
      <Drawer title="القائمة" onClose={onClose} open={menuOpen}>
        <NavLink
          to={"/"}
          className="logo h-36 flex items-center justify-center rounded-lg mb-10"
          onClick={() => setMenuOpen(false)}
        >
          {/* <Logo className="fill-calypso-900 hover:fill-calypso-950 h-full rounded-lg" /> */}
          <img src="/samara.jpg" alt="samara logo" className="h-full" />
        </NavLink>

        <AntdMenu
          selectedKeys={[location.pathname]}
          defaultOpenKeys={openKeys}
          mode="inline"
          items={items}
          onClick={() => setMenuOpen(false)}
          className="text-base"
        />
      </Drawer>
    </>
  );
};

export default Menu;
