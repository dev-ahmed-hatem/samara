import { Tabs } from "antd";
// import ClientSettingsTab from "@/components/settings/clients/ClientsSettingsTab";
// import FinancialsSettingsTab from "@/components/settings/financials/FinancialsSettingsTab";
// import UserSettingsTab from "@/components/settings/users/UserSettingsTab";
import { useAppSelector } from "@/app/redux/hooks";
import AccountSettingsTab from "@/components/settings/account/AccountSettingsTab";

const SettingsPage = () => {
  const user = useAppSelector((state) => state.auth.user);
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="mb-6 text-2xl font-bold">الإعدادات</h1>

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
          {
            key: "clients",
            label: "الأعضاء",
            // children: <ClientSettingsTab />,
          },
          {
            key: "financials",
            label: "الماليات",
            // children: <FinancialsSettingsTab />,
          },
          // ...(user?.role === "مدير"
          //   ? [
          //       {
          //         key: "users",
          //         label: "المستخدمين",
          //         children: <UserSettingsTab />,
          //       },
          //     ]
          //   : []),
        ]}
      />
    </div>
  );
};

export default SettingsPage;
