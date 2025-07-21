import { removeTokens } from "@/utils/storage";
import { Button } from "antd";

const UserMenu = ({ role }: { role: string }) => {
  const logout = () => {
    removeTokens();
    location.href = "/";
  };

  return (
    <div>
      <span>{role}</span>
      <div className="w-[80%] mx-auto my-2 h-[1px] bg-gray-300"></div>
      <Button
        className="flex my-3 w-full bg-orange font-bold !outline-none
       hover:!border-orange-200 hover:!bg-orange-200 hover:!text-black"
        onClick={() => {
          logout();
        }}
      >
        تسجيل خروج
      </Button>
    </div>
  );
};

export default UserMenu;
