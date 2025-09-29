import { IoMenu } from "react-icons/io5";
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
    <div className="px-10 md:px-14 flex justify-between items-center h-20 bg-gradient-to-r from-[#b79237] via-[#a07f30] to-[#7a6123] shadow-md">
      {/* Left: Menu Button */}
      <IoMenu
        className="text-white hover:text-yellow-200 text-4xl md:text-5xl cursor-pointer"
        onClick={() => {
          setMenuOpen(!menuOpen);
        }}
      />

      {/* Center: Logo */}
      <div className="logo h-12 md:h-16 flex items-center">
        <NavLink to={"/"} className="h-full">
          <img
            src="/samara.jpg"
            alt="samara logo"
            className="h-full rounded border-2 border-white shadow-sm"
          />
        </NavLink>
      </div>

      {/* Right: User Avatar */}
      <div className="user">
        <Popover
          content={
            <UserMenu role={user?.role!} close={() => setOpen(false)} />
          }
          title={
            user?.employee_profile.name || (
              <span className="text-red-500">بلا اسم</span>
            )
          }
          trigger="click"
          open={open}
          onOpenChange={handleOpenChange}
        >
          <RxAvatar className="text-white hover:text-yellow-200 text-4xl md:text-5xl cursor-pointer" />
        </Popover>
      </div>
    </div>
  );
};

export default Navbar;
