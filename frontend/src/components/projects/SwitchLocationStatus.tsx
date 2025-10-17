import { useSwitchLocationActiveMutation } from "@/app/api/endpoints/locations";
import { useNotification } from "@/providers/NotificationProvider";
import { Location } from "@/types/location";
import { Space, Switch } from "antd";

const SwitchLocationStatus = ({ location }: { location: Location }) => {
  const notification = useNotification();
  const isActive = location.is_active;

  const [switchActive, { isLoading }] = useSwitchLocationActiveMutation();

  const toggleStatus = async () => {
    try {
      await switchActive(location.id);
      notification.success({
        message: "تم تغيير الحالة بنجاح",
      });
    } catch {
      notification.error({
        message: "حدث خطأ في تغيير الحالة ! برجاء إعادة المحاولة",
      });
    }
  };

  return (
    <Space>
      <Switch
        checked={isActive}
        onChange={(checked) => toggleStatus()}
        checkedChildren="نشط"
        unCheckedChildren="غير نشظ"
        style={{
          backgroundColor: isActive ? "#52c41a" : "#ff4d4f",
        }}
        loading={isLoading}
      />
    </Space>
  );
};

export default SwitchLocationStatus;
