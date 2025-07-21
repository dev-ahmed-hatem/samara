import { Drawer, Menu as AntdMenu } from "antd";
import Logo from "./Logo";
import "../styles/menu.css";
import { NavLink, useLocation } from "react-router";
import { useEffect, useMemo, useState } from "react";
import appRoutes, { type AppRoute } from "../app/appRoutes";
import { ItemType } from "antd/es/menu/interface";

const mapRoute = ({ path, label, icon, children }: AppRoute): ItemType => ({
  key: path!,
  icon,
  label:
    children && children?.length > 0 ? (
      label
    ) : (
      <NavLink to={path!}>{label}</NavLink>
    ),
  children: children?.length
    ? children.map((subRoute) =>
        mapRoute({ ...subRoute, path: `${path}/${subRoute.path}` })
      )
    : undefined,
});

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

  const items = useMemo(() => {
    return appRoutes[0].children!.map(mapRoute);
  }, []);

  useEffect(() => {
    const activeSubMenu = items.find((item: any) =>
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
          className="logo h-20 flex items-center justify-center rounded-lg mb-10"
          onClick={() => setMenuOpen(false)}
        >
          <Logo className="fill-calypso-900 hover:fill-calypso-950 h-full rounded-lg" />
        </NavLink>

        <AntdMenu
          selectedKeys={[location.pathname.slice(1)]}
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
