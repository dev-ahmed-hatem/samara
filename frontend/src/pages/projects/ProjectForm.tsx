import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import { useProjectMutation } from "@/app/api/endpoints/projects";
import { useAppSelector } from "@/app/redux/hooks";
import { useNotification } from "@/providers/NotificationProvider";
import { Project } from "@/types/project";
import { handleServerErrors } from "@/utils/handleForm";
import { Form, Input, Button, Card, Col, Row } from "antd";
import { useEffect } from "react";
import { useNavigate } from "react-router";

type ProjectFormValues = {
  name: string;
};

const ProjectForm = ({
  initialValues,
  project_id,
}: {
  initialValues?: Project;
  project_id?: string;
}) => {
  const navigate = useNavigate();
  const notification = useNotification();
  const [form] = Form.useForm<ProjectFormValues>();
  const user = useAppSelector((state) => state.auth.user);

  const [
    handleProject,
    { data: project, isSuccess, isLoading, isError, error: projectError },
  ] = useProjectMutation();

  const handleSubmit = (values: ProjectFormValues) => {
    handleProject({
      data: values,
      method: initialValues ? "PATCH" : "POST",
      url: project_id
        ? `/projects/projects/${project_id}/`
        : "/projects/projects/",
    });
  };

  useEffect(() => {
    if (isError) {
      const error = projectError as axiosBaseQueryError;
      if (error.status == 400) {
        handleServerErrors({
          errorData: error.data as Record<string, string[]>,
          form,
        });
      }
      notification.error({ message: "خطأ في حفظ المشروع!" });
    }
  }, [isError]);

  useEffect(() => {
    if (isSuccess) {
      notification.success({
        message: `تم ${initialValues ? "تعديل بيانات" : "إضافة"} المشروع`,
      });
      navigate(
        `/${user!.role}/projects/project-profile${
          initialValues ? `/${initialValues.id}` : `/${project.id}`
        }`
      );
    }
  }, [isSuccess]);

  return (
    <Card title="إضافة مشروع" className="mb-6">
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
              label="اسم المشروع"
              rules={[{ required: true, message: "يرجى إدخال اسم المشروع" }]}
            >
              <Input placeholder="أدخل اسم المشروع" />
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

export default ProjectForm;
