import {
  Form,
  Radio,
  Upload,
  Input,
  Button,
  Row,
  Col,
  message,
  Card,
  Descriptions,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { RcFile } from "antd/es/upload";
import { useState } from "react";

const options = [
  { label: "جيد", value: "جيد" },
  { label: "يحتاج إلى معالجة", value: "يحتاج إلى معالجة" },
];

type VisitFormData = {
  guardPresence: string;
  uniformCleanliness: string;
  attendanceRecords: string;
  shiftHandover: string;
  lighting: string;
  cameras: string;
  securityVehicles: string;
  radioDevices: string;
  notes?: string;
  attachment?: RcFile[];
};

const VisitForm = () => {
  const [form] = Form.useForm<VisitFormData>();
  const [fileList, setFileList] = useState<RcFile[]>([]);

  const handleFinish = (values: VisitFormData) => {
    console.log("Form Data:", values);
    message.success("تم إرسال النموذج بنجاح");
  };

  const handleUploadChange = ({ fileList }: any) => {
    setFileList(fileList.map((file: any) => file.originFileObj));
  };

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-10 text-center text-calypso">
        تقرير زيارة ميدانية
      </h1>
      {/* Visit Info */}
      <Card title="معلومات الزيارة" className="bg-orange-50 mb-6 shadow-md">
        <Descriptions
          bordered
          column={{ xs: 1, sm: 1, md: 2 }}
          styles={{ label: { fontWeight: 600, fontSize: 14 } }}
          size="default"
        >
          <Descriptions.Item label="رقم الزيارة">#12345</Descriptions.Item>
          <Descriptions.Item label="التاريخ">22-07-2025</Descriptions.Item>
          <Descriptions.Item label="الوقت">14:30</Descriptions.Item>
          <Descriptions.Item label="إحداثيات GPS">
            <div className="flex items-center gap-2">
              <Button
                size="small"
                type="link"
                href="https://www.google.com/maps?q=24.7136,46.6753"
                target="_blank"
                rel="noopener noreferrer"
              >
                24.7136°N, 46.6753°E
              </Button>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="الهدف من الزيارة" span={2}>
            متابعة أداء الحراس والتأكد من الانضباط
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Project Info */}
      <Card title="معلومات المشروع" className="bg-orange-50 mb-6 shadow-md">
        <Descriptions
          column={{ xs: 1, sm: 1, md: 2 }}
          styles={{ label: { fontWeight: 600, fontSize: 14 } }}
          bordered
        >
          <Descriptions.Item label="اسم المشروع">
            مجمع العليا الإداري
          </Descriptions.Item>
          <Descriptions.Item label="إجمالي رجال الأمن">12</Descriptions.Item>
          <Descriptions.Item label="إجمالي المشرفين">2</Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Visit Comments */}
      <Card title="ملاحظات أثناء الزيارة" className="p-4 mx-auto">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleFinish}
          initialValues={{}}
        >
          <Row gutter={[16, 16]}>
            {[
              { name: "guardPresence", label: "تواجد الحارس في موقعه" },
              { name: "uniformCleanliness", label: "نظافة الزي الرسمي" },
              {
                name: "attendanceRecords",
                label: "سجلات الحضور والانصراف والسجلات الخاصة بالموقع",
              },
              {
                name: "shiftHandover",
                label: "الانضباط في تسليم واستلام الورديات",
              },
              { name: "lighting", label: "الإضاءة حول محيط الموقع" },
              { name: "cameras", label: "كاميرات المراقبة" },
              { name: "securityVehicles", label: "السيارات الأمنية" },
              { name: "radioDevices", label: "عمل أجهزة الاتصال اللاسلكي" },
            ].map((field) => (
              <Col xs={24} sm={24} key={field.name}>
                <Form.Item
                  name={field.name as keyof VisitFormData}
                  label={<span className="text-base">{field.label}</span>}
                  rules={[{ required: true, message: "الرجاء اختيار تقييم" }]}
                >
                  <Radio.Group
                    options={options}
                    optionType="button"
                    buttonStyle="solid"
                  />
                </Form.Item>
              </Col>
            ))}

            <Col span={24}>
              <Form.Item
                label={<span className="text-base">صورة مرفقة (اختياري)</span>}
                name="attachment"
              >
                <Upload
                  beforeUpload={() => false}
                  onChange={handleUploadChange}
                  fileList={fileList.map((file) => ({
                    uid: file.uid,
                    name: file.name,
                    status: "done",
                    url: URL.createObjectURL(file),
                  }))}
                  accept="image/*"
                >
                  <Button icon={<UploadOutlined />}>تحميل صورة</Button>
                </Upload>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                name="notes"
                label={
                  <span className="text-base">توجيهات أو توصيات من العميل</span>
                }
                rules={[{ max: 500, message: "الحد الأقصى 500 حرف" }]}
              >
                <Input.TextArea
                  rows={4}
                  placeholder="أدخل التوصيات أو الملاحظات هنا..."
                  className="text-base"
                />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item className="flex justify-center">
                <Button
                  type="primary"
                  htmlType="submit"
                  className="w-full md:w-auto mx-auto"
                  size="large"
                >
                  إرسال النموذج
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>
    </>
  );
};

export default VisitForm;
