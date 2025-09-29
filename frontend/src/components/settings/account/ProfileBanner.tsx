import { Card, Avatar } from "antd";
import {
  UserOutlined,
  IdcardOutlined,
  CrownOutlined,
  TeamOutlined,
} from "@ant-design/icons";

const roleConfig: Record<
  string,
  { color: string; icon: React.ReactNode; label: string }
> = {
  admin: {
    color: "#FBBF24", // amber-400 → rich golden, readable on gray-600
    icon: <CrownOutlined />,
    label: "مدير",
  },
  supervisor: {
    color: "#60A5FA", // blue-400 → brighter, clearer contrast
    icon: <TeamOutlined />,
    label: "مشرف",
  },
  moderator: {
    color: "#34D399", // emerald-400 → lively green, strong against gray
    icon: <UserOutlined />,
    label: "مستخدم نظام",
  },
};

const ProfileBanner = ({ user }: { user: any }) => {
  const profile = user?.employee_profile;
  const role = roleConfig[user?.role] || {
    color: "#6B7280",
    icon: <UserOutlined />,
    label: user?.role,
  };

  return (
    <Card
      className="rounded-2xl border-0 text-white 
             bg-gradient-to-bl from-gray-700  via-gray-600 to-gray-700 
             shadow-2xl"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Avatar & Main Info */}
        <div className="flex flex-wrap items-center gap-6">
          {profile?.image ? (
            <Avatar
              src={profile.image}
              size={120}
              className="border-4 border-white shadow-lg"
            />
          ) : (
            <Avatar
              size={130}
              className="bg-white text-gray-700 border-4 border-gray-300 shadow-lg flex items-center justify-center"
              icon={<UserOutlined className="text-4xl" />}
            />
          )}

          <div>
            <h2 className="text-2xl font-bold">
              {profile?.name ?? "بدون اسم"}
            </h2>
            <p className="text-gray-200 flex items-center gap-2">
              <IdcardOutlined className="text-2xl" />{" "}
              {profile?.employee_id ?? "بدون رقم"}
            </p>
          </div>
        </div>

        {/* Position & Role */}
        <div className="bg-white/20 backdrop-blur-md rounded-xl px-6 py-5 shadow-lg text-center sm:text-right min-w-[240px]">
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-white drop-shadow-md">
              المسمى الوظيفي
            </h3>
            <p
              className="text-gray-200 font-medium drop-shadow-sm"
              style={{
                color: role.color,
                textShadow: "0 1px 3px rgba(0,0,0,0.6)",
              }}
            >
              {profile?.position || "غير محدد"}
            </p>
          </div>
          <div>
            <h3 className="text-lg text-white drop-shadow-md font-bold">
              الدور
            </h3>
            <p
              className="font-medium flex items-center gap-2 justify-center sm:justify-start drop-shadow-md"
              style={{
                color: role.color,
                textShadow: "0 1px 3px rgba(0,0,0,0.6)",
              }}
            >
              {role.icon} {role.label}
            </p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ProfileBanner;
