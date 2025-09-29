import { Card, Form, Input, Button, DatePicker, FormInstance } from "antd";
import { useEffect, useState } from "react";
import UploadImage from "@/components/file-handling/UploadImage";
import dayjs, { Dayjs } from "dayjs";
import { useEmployeeMutation } from "@/app/api/endpoints/employees";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import { handleServerErrors } from "@/utils/handleForm";
import { useNotification } from "@/providers/NotificationProvider";
import { useAppDispatch } from "@/app/redux/hooks";
import { setEmployeeProfile } from "@/app/slices/authSlice";

export type UserFormValues = {
  id: string;
  name: string;
  username: string;
  email?: string;
  phone?: string;
  role: string;
  birthdate: string | Dayjs;
  image?: string | null;
  position?: string;
  national_id?: string;
  employee_id?: string;
};

const EmployeeEditForm = ({
  initialValues,
}: {
  initialValues?: Partial<UserFormValues>;
}) => {
  const notification = useNotification();
  const dispacth = useAppDispatch();
  const [form] = Form.useForm();
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [
    handleEmployee,
    { data, isSuccess, isLoading, isError, error: employeeError },
  ] = useEmployeeMutation();

  const handleFinish = (values: any) => {
    const data = {
      ...values,
      image: imageFile,
      birthdate: values.birthdate.format("YYYY-MM-DD"),
    };

    handleEmployee({
      url: `/employees/employees/${initialValues?.id}/`,
      method: "PATCH",
      data,
    });
  };

  useEffect(() => {
    if (isError) {
      const error = employeeError as axiosBaseQueryError;
      if (error.status == 400) {
        handleServerErrors({
          errorData: error.data as Record<string, string[]>,
          form,
        });
      }

      notification.error({ message: "خطأ في حفظ البيانات!" });
    }
  }, [isError]);

  useEffect(() => {
    if (isSuccess) {
      notification.success({
        message: "تم حفظ البيانات",
      });
      dispacth(setEmployeeProfile(data));
      setImageFile(null);
    }
  }, [isSuccess]);

  return (
    <Card title="بيانات المستخدم" className="shadow-md mx-auto">
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          ...initialValues,
          birthdate: dayjs(initialValues?.birthdate, "YYYY-MM-DD"),
        }}
        onFinish={handleFinish}
      >
        {/* image Upload */}
        <Form.Item label="الصورة الشخصية" className="text-center">
          <UploadImage setFile={setImageFile} />
        </Form.Item>

        <Form.Item
          name="name"
          label="الاسم"
          rules={[{ required: true, message: "يرجى إدخال الاسم" }]}
        >
          <Input placeholder="أدخل اسم المستخدم" />
        </Form.Item>

        <Form.Item
          name="username"
          label="اسم المستخدم"
          rules={[{ required: true, message: "يرجى إدخال اسم المستخدم" }]}
        >
          <Input placeholder="اسم الدخول للنظام" />
        </Form.Item>

        <Form.Item name="email" label="البريد الإلكتروني">
          <Input type="email" />
        </Form.Item>

        <Form.Item name="phone" label="رقم الهاتف">
          <Input />
        </Form.Item>

        <Form.Item name="birthdate" label="تاريخ الميلاد">
          <DatePicker
            className="w-full"
            placeholder="اختر تاريخ الميلاد"
            format="YYYY-MM-DD"
          />
        </Form.Item>

        <Form.Item label="المسمى الوظيفي">
          <Input value={initialValues?.position} disabled />
        </Form.Item>

        <Form.Item label="رقم الهوية">
          <Input value={initialValues?.national_id} disabled />
        </Form.Item>

        <Form.Item label="رقم الموظف">
          <Input value={initialValues?.employee_id} disabled />
        </Form.Item>

        <Form.Item className="text-center">
          <Button
            type="primary"
            htmlType="submit"
            loading={isLoading}
            className="px-4"
            size="large"
          >
            حفظ
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default EmployeeEditForm;
