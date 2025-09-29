import { removeTokens } from "@/utils/storage";
import { Avatar, Button, Divider, Tag } from "antd";
import {
  SettingOutlined,
  LogoutOutlined,
  CrownOutlined,
  TeamOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";

const roleConfig: Record<
  string,
  { color: string; icon: React.ReactNode; label: string }
> = {
  admin: {
    color: "gold",
    icon: <CrownOutlined />,
    label: "مدير",
  },
  supervisor: {
    color: "blue",
    icon: <TeamOutlined />,
    label: "مشرف",
  },
  moderator: {
    color: "green",
    icon: <UserOutlined />,
    label: "مستخدم نظام",
  },
};

const UserMenu = ({
  role,
  photo,
  name,
  close,
}: {
  role: string;
  photo?: string | null;
  name?: string | null;
  close?: Function;
}) => {
  const navigate = useNavigate();
  const logout = () => {
    removeTokens();
    location.href = "/";
  };

  const config = roleConfig[role] || {
    color: "default",
    icon: <UserOutlined />,
    label: role,
  };

  return (
    <div className="w-56 text-center">
      {/* User Avatar */}
      <div className="flex flex-col items-center mb-3">
        <Avatar
          size={80}
          src={photo || undefined}
          icon={!photo && <UserOutlined />}
          className="bg-gray-200 text-gray-600"
        />
        {name && <div className="mt-2 font-semibold">{name}</div>}
      </div>

      {/* Role Tag */}
      <div className="flex justify-center mb-2">
        <Tag
          color={config.color}
          className="px-3 py-1 text-base rounded-lg flex items-center gap-2"
        >
          {config.icon} {config.label}
        </Tag>
      </div>

      <Divider className="my-3" />

      {/* Settings Button */}
      <Button
        block
        type="primary"
        icon={<SettingOutlined />}
        className="my-2"
        onClick={() => {
          navigate(`/${role}/settings/`);
          if (close) close();
        }}
      >
        الإعدادات
      </Button>

      {/* Logout Button */}
      <Button
        block
        danger
        type="primary"
        icon={<LogoutOutlined />}
        onClick={logout}
      >
        تسجيل خروج
      </Button>
    </div>
  );
};

export default UserMenu;
