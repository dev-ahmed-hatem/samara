import { IoMenu } from "react-icons/io5";
import Logo from "../Logo";
import { RxAvatar } from "react-icons/rx";
import { Popover } from "antd";
import { useState } from "react";
import UserMenu from "./UserMenu";
import { NavLink } from "react-router";
import { useAppSelector } from "@/app/redux/hooks";

const Navbar = ({
  menuOpen,
  setMenuOpen,
}: {
  menuOpen: boolean;
  setMenuOpen: Function;
}) => {
  const [open, setOpen] = useState(false);
  const user = useAppSelector((state) => state.auth.user);

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
  };

  return (
    <div className="padding-container flex justify-between items-center bg-orange py-2">
      <IoMenu
        className="text-calypso-900 hover:text-calypso-950 text-4xl md:text-5xl cursor-pointer"
        onClick={() => {
          setMenuOpen(!menuOpen);
        }}
      />
      <div className="logo h-12 md:h-16">
        <NavLink to={"/"}>
          <Logo className="fill-calypso-900 hover:fill-calypso-950" />
        </NavLink>
      </div>
      <div className="user">
        <Popover
          content={
            <UserMenu
              role={
                user?.is_root ? "مطور" : user?.is_superuser ? "مدير" : "مشرف"
              }
            />
          }
          title={user?.name || <span className="text-red-500">بلا اسم</span>}
          trigger="click"
          open={open}
          onOpenChange={handleOpenChange}
        >
          <RxAvatar className="text-4xl md:text-5xl text-calypso-900 hover:text-calypso-950 cursor-pointer" />
        </Popover>
      </div>
    </div>
  );
};

export default Navbar;
