import { User } from "@/types/user";
import { Modal, Form, Input, Button, FormInstance } from "antd";
import { useEffect } from "react";

interface SupervisorFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: any) => void;
  initialValues?: User;
  loading: boolean;
  form: FormInstance;
  changePassword: boolean;
}
const SupervisorForm = ({
  open,
  onClose,
  onSubmit,
  initialValues,
  loading,
  form,
  changePassword,
}: SupervisorFormProps) => {
  useEffect(() => {
    if (initialValues) {
      form.setFieldsValue({
        ...initialValues,
        ...initialValues?.employee_profile,
      });
    } else {
      form.resetFields();
    }
  }, [initialValues]);

  const handleFinish = (values: any) => {
    onSubmit(values);
  };

  return (
    <Modal
      title={initialValues ? "تعديل اسم مستخدم" : "إضافة مشرف"}
      open={open}
      onCancel={onClose}
      footer={null}
      destroyOnClose
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="space-y-4"
      >
        {/* Create Mode */}
        {!changePassword && (
          <>
            <Form.Item
              label="الاسم الكامل"
              name="name"
              rules={[{ required: true, message: "يرجى إدخال الاسم الكامل" }]}
            >
              <Input placeholder="أدخل الاسم الكامل" />
            </Form.Item>

            <Form.Item
              label="اسم المستخدم"
              name="username"
              rules={[{ required: true, message: "يرجى إدخال اسم المستخدم" }]}
            >
              <Input placeholder="أدخل اسم المستخدم" />
            </Form.Item>
          </>
        )}

        {(!initialValues || changePassword) && (
          <>
            <Form.Item
              label="كلمة المرور"
              name="password"
              rules={[{ required: true, message: "يرجى إدخال كلمة المرور" }]}
            >
              <Input.Password placeholder="أدخل كلمة المرور" />
            </Form.Item>

            <Form.Item
              label="تأكيد كلمة المرور"
              name="password2"
              dependencies={["password"]}
              rules={[
                { required: true, message: "يرجى تأكيد كلمة المرور" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("password") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("كلمتا المرور غير متطابقتين")
                    );
                  },
                }),
              ]}
            >
              <Input.Password placeholder="أعد إدخال كلمة المرور" />
            </Form.Item>
          </>
        )}
        {!changePassword && (
          <>
            <Form.Item
              label="رقم الموظف"
              name="employee_id"
              rules={[{ required: true, message: "يرجى إدخال رقم الموظف" }]}
            >
              <Input placeholder="أدخل رقم الموظف" />
            </Form.Item>

            <Form.Item
              label="المسمى الوظيفي"
              name="position"
              rules={[{ required: true, message: "يرجى إدخال المسمى الوظيفي" }]}
            >
              <Input placeholder="أدخل المسمى الوظيفي" />
            </Form.Item>

            <Form.Item
              label="رقم الجوال"
              name="phone"
              rules={[
                { required: true, message: "يرجى إدخال رقم الجوال" },
                { pattern: /^[0-9]+$/, message: "يرجى إدخال أرقام فقط" },
              ]}
            >
              <Input placeholder="أدخل رقم الجوال" maxLength={15} />
            </Form.Item>

            <Form.Item
              label="رقم الهوية"
              name="national_id"
              rules={[
                { required: true, message: "يرجى إدخال رقم الهوية" },
                { pattern: /^[0-9]+$/, message: "يرجى إدخال أرقام فقط" },
              ]}
            >
              <Input placeholder="أدخل رقم الهوية" maxLength={20} />
            </Form.Item>
          </>
        )}

        <div className="flex justify-end gap-4 flex-wrap mt-4">
          <Button onClick={onClose} disabled={loading}>
            إلغاء
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            حفظ
          </Button>
        </div>
      </Form>
    </Modal>
  );
};

export default SupervisorForm;
