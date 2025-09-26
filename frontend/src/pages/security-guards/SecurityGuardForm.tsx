import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import { useSecurityGuardMutation } from "@/app/api/endpoints/security_guards";
import { useAppSelector } from "@/app/redux/hooks";
import { useNotification } from "@/providers/NotificationProvider";
import { SecurityGuard } from "@/types/scurityGuard";
import { handleServerErrors } from "@/utils/handleForm";
import { Form, Input, Button, Card, Col, Row } from "antd";
import { useEffect } from "react";
import { useNavigate } from "react-router";

type SecurityGuardFormValues = {
  name: string;
  employee_id: string;
};

const SecurityGuardForm = ({
  initialValues,
  security_guard_id,
}: {
  initialValues?: SecurityGuard;
  security_guard_id?: string;
}) => {
  const navigate = useNavigate();
  const notification = useNotification();
  const [form] = Form.useForm<SecurityGuardFormValues>();
  const user = useAppSelector((state) => state.auth.user);

  const [
    handleSecurityGuard,
    { data: client, isSuccess, isLoading, isError, error: clientError },
  ] = useSecurityGuardMutation();

  const handleSubmit = (values: SecurityGuardFormValues) => {
    handleSecurityGuard({
      data: values,
      method: initialValues ? "PATCH" : "POST",
      url: security_guard_id
        ? `/employees/security-guards/${security_guard_id}/`
        : "/employees/security-guards/",
    });
  };

  useEffect(() => {
    if (isError) {
      const error = clientError as axiosBaseQueryError;
      if (error.status == 400) {
        handleServerErrors({
          errorData: error.data as Record<string, string[]>,
          form,
        });
      }

      notification.error({ message: "خطأ في إضافة رجل الأمن!" });
    }
  }, [isError]);

  useEffect(() => {
    if (isSuccess) {
      notification.success({
        message: `تم ${initialValues ? "تعديل بيانات" : "إضافة"} رجل الأمن`,
      });
      navigate(
        `/${user!.role}/security-guards/guard-profile/${
          initialValues ? initialValues.id : client.id
        }`
      );
    }
  }, [isSuccess]);

  return (
    <Card title="إضافة فرد أمن" className="mb-6">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        initialValues={initialValues}
        scrollToFirstError
      >
        <Row gutter={16} className="flex items-center">
          <Col xs={24} md={12}>
            <Form.Item
              name="name"
              label="الاسم"
              rules={[{ required: true, message: "يرجى إدخال الاسم" }]}
            >
              <Input placeholder="أدخل الاسم" />
            </Form.Item>
          </Col>

          <Col xs={24} md={12}>
            <Form.Item
              name="employee_id"
              label="الرقم الوظيفي"
              rules={[{ required: true, message: "يرجى إدخال الرقم الوظيفي" }]}
            >
              <Input placeholder="أدخل الرقم الوظيفي" />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item style={{ textAlign: "center" }}>
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={isLoading}
          >
            {initialValues ? "تعديل" : "إضافة"}
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default SecurityGuardForm;
