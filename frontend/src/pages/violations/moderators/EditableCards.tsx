import { Card, Input, Button, Tag } from "antd";
import { EditOutlined, SaveOutlined, CloseOutlined } from "@ant-design/icons";
import { useState } from "react";
import { textify } from "@/utils";
import { useNotification } from "@/providers/NotificationProvider";
import { useViolationMutation } from "@/app/api/endpoints/visits";
import { Violation } from "@/types/violation";

const EditableFieldCard = ({
  title,
  field,
  value,
  id,
}: {
  title: string;
  field: keyof Violation;
  value?: string;
  id: string;
}) => {
  const [editing, setEditing] = useState(false);
  const [newValue, setNewValue] = useState(value || "");

  const notification = useNotification();
  const [updateViolation, { isLoading }] = useViolationMutation();

  const handleSave = async () => {    
    try {
      await updateViolation({
        url: `/visits/violations/${id}/confirm_by_monitoring/`,
        method: "PATCH",
        data: { [field]: newValue },
      });
      notification.success({ message: "تم حفظ التعديل بنجاح" });
      setEditing(false);
    } catch (err) {
      notification.error({ message: "حدث خطأ أثناء الحفظ" });
    }
  };

  return (
    <Card
      title={title}
      className="text-lg"
      extra={
        editing ? (
          <div className="flex gap-2">
            <Button
              type="primary"
              icon={<SaveOutlined />}
              size="small"
              onClick={handleSave}
              loading={isLoading}
            >
              حفظ
            </Button>
            <Button
              icon={<CloseOutlined />}
              size="small"
              onClick={() => setEditing(false)}
              disabled={isLoading}
            >
              إلغاء
            </Button>
          </div>
        ) : (
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => setEditing(true)}
          />
        )
      }
    >
      {editing ? (
        <Input.TextArea
          rows={4}
          value={newValue}
          onChange={(e) => setNewValue(e.target.value)}
          placeholder={`اكتب ${title.toLowerCase()} هنا`}
        />
      ) : (
        textify(value) ?? <Tag>لا يوجد</Tag>
      )}
    </Card>
  );
};

export default EditableFieldCard;
