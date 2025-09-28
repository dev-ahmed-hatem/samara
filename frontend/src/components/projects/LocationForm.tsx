import { Button, Form, Input } from "antd";

export type LocationFormValues = {
  name: string;
};

const LocationForm = ({
  initialValues,
  onSubmit,
  loading,
}: {
  initialValues?: LocationFormValues;
  onSubmit: (values: LocationFormValues) => void;
  loading?: boolean;
}) => {
  const [form] = Form.useForm<LocationFormValues>();

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={initialValues}
      onFinish={onSubmit}
    >
      <Form.Item
        name="name"
        label="اسم الموقع"
        rules={[{ required: true, message: "يرجى إدخال اسم الموقع" }]}
      >
        <Input placeholder="أدخل اسم الموقع" />
      </Form.Item>

      <Form.Item style={{ textAlign: "center" }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          {initialValues ? "تعديل" : "إضافة"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LocationForm;
