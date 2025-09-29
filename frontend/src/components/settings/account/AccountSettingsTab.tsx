import { useAppSelector } from "@/app/redux/hooks";
import ChangePassword from "./ChangePassword";
import EmployeeEditForm from "./EmployeeForm";

const AccountSettingsTab = () => {
  const user = useAppSelector((state) => state.auth.user);
  return (
    <div className="space-y-6">
      <EmployeeEditForm
        initialValues={{ ...user!, ...user?.employee_profile }}
      />
      <ChangePassword />
    </div>
  );
};

export default AccountSettingsTab;
