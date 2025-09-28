import { Button, Form, Select } from "antd";

export type ProjectGuardFormValues = {
  name: string; // guard id
  location: string; // location id
  shift: string; // shift id
};

const ProjectGuardForm = ({
  project_id,
  initialValues,
  onSubmit,
  loading,
}: {
  project_id: string;
  initialValues?: ProjectGuardFormValues;
  onSubmit: (values: ProjectGuardFormValues) => void;
  loading?: boolean;
}) => {
  const [form] = Form.useForm<ProjectGuardFormValues>();

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={onSubmit}
    >
      <Form.Item
        name="guard"
        label="رجل الأمن"
        rules={[{ required: true, message: "يرجى اختيار رجل الأمن" }]}
      >
        <Select
          showSearch
          placeholder="اختر رجل الأمن"
          // options={guardsOptions}
          // filterOption={(input, option) =>
          //   (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          // }
        />
      </Form.Item>

      <Form.Item
        name="location"
        label="الموقع"
        rules={[{ required: true, message: "يرجى اختيار الموقع" }]}
      >
        <Select
          showSearch
          placeholder="اختر الموقع"
          // options={locationsOptions}
          // filterOption={(input, option) =>
          //   (option?.label ?? "").toLowerCase().includes(input.toLowerCase())
          // }
        />
      </Form.Item>

      <Form.Item
        name="shift"
        label="الوردية"
        rules={[{ required: true, message: "يرجى اختيار الوردية" }]}
      >
        {/* <Select placeholder="اختر الوردية" options={shiftsOptions} /> */}
      </Form.Item>

      <Form.Item style={{ textAlign: "center" }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          {initialValues ? "تعديل" : "إضافة"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProjectGuardForm;
