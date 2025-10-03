import { Divider, Tabs } from "antd";
import { useAppSelector } from "@/app/redux/hooks";
import AccountSettingsTab from "@/components/settings/account/AccountSettingsTab";
import ProfileBanner from "@/components/settings/account/ProfileBanner";
import SupervisorSettingsTab from "@/components/settings/supervisors/SupervisorSettingsTab";

const SettingsPage = () => {
  const user = useAppSelector((state) => state.auth.user);
  return (
    <div className="max-w-7xl mx-auto">
      <h1 className="mb-6 text-2xl font-bold">الإعدادات</h1>

      <ProfileBanner user={user!} />

      <Divider />

      <Tabs
        renderTabBar={(props, DefaultTabBar) => (
          <DefaultTabBar {...props} className="md:ps-2" />
        )}
        direction="rtl"
        defaultActiveKey="account"
        items={[
          {
            key: "account",
            label: "الحساب",
            children: <AccountSettingsTab />,
          },
          ...(user?.role === "moderator"
            ? [
                {
                  key: "users",
                  label: "المشرفين",
                  children: <SupervisorSettingsTab />,
                },
              ]
            : []),
        ]}
      />
    </div>
  );
};

export default SettingsPage;
