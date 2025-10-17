import { useState } from "react";
import { Modal, Button, Card, Input, Tag } from "antd";
import {
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  FileTextOutlined,
} from "@ant-design/icons";
import { textify } from "@/utils";
import { useVisitMutation } from "@/app/api/endpoints/visits";
import { useNotification } from "@/providers/NotificationProvider";

type VisitNotesModalProps = {
  visit_id: string;
  value?: string;
  disabled: boolean;
};

const VisitNotesModal = ({
  visit_id,
  value,
  disabled,
}: VisitNotesModalProps) => {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [newValue, setNewValue] = useState(value || "");
  const notification = useNotification();

  const [updateVisit, { isLoading }] = useVisitMutation();

  const handleSave = async () => {
    try {
      await updateVisit({
        url: `/visits/visits/${visit_id}/`,
        method: "PATCH",
        data: { notes: newValue },
      });
      notification.success({ message: "تم حفظ الملاحظات بنجاح" });
      setEditing(false);
    } catch (err) {
      notification.error({ message: "حدث خطأ أثناء الحفظ" });
    }
  };

  return (
    <>
      <Button
        type="text"
        className="text-gray-600 hover:text-blue-600"
        icon={<FileTextOutlined />}
        size="middle"
        onClick={() => setOpen(true)}
        disabled={disabled}
        title="ملاحظات"
      />

      <Modal
        title={null}
        open={open}
        footer={null}
        className="w-[95%] top-10"
        onCancel={() => setOpen(false)}
      >
        <Card
          title="ملاحظات قسم الإشراف والمتابعة"
          className="mt-10 text-lg"
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
              value={newValue || value}
              onChange={(e) => setNewValue(e.target.value)}
              placeholder={`اكتب الملاحظات هنا`}
            />
          ) : (
            textify(value) ?? <Tag>لا يوجد</Tag>
          )}
        </Card>
      </Modal>
    </>
  );
};

export default VisitNotesModal;
