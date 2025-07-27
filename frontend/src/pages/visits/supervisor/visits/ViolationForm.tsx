import {
  Form,
  Input,
  Select,
  Checkbox,
  Upload,
  Button,
  Card,
  UploadFile,
  Descriptions,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useState } from "react";

const { TextArea } = Input;

const violationTypes = [
  "تأخير عن الدوام",
  "التدخين بالموقع أثناء العمل",
  "عدم الالتزام بالزي الرسمي",
  "غياب",
  "ترك الموقع (انسحاب)",
  "التجمع في منطقة العمل",
  "الشكوى من العميل",
  "عدم احترام الرئيس المباشر",
  "استخدام الجوال أثناء العمل",
  "أخرى",
];

const severityLevels = ["منخفضة", "متوسطة", "عالية"];

const ViolationForm: React.FC = () => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState<UploadFile[]>([]);

  const handleSubmit = (values: any) => {
    console.log("Form Submitted:", values);
  };

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-10 text-center text-red-600">
        الإبلاغ عن مخالفة
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

      {/* Violation Form */}
      <Card
        title={<span className="text-red-600 font-bold">تقرير مخالفة</span>}
        className="shadow-md"
      >
        <Form
          layout="vertical"
          form={form}
          onFinish={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
        >
          {/* نوع المخالفة */}
          <Form.Item
            name="violationType"
            label="نوع المخالفة"
            rules={[{ required: true, message: "الرجاء اختيار نوع المخالفة" }]}
          >
            <Select placeholder="اختر نوع المخالفة">
              {violationTypes.map((type) => (
                <Select.Option key={type} value={type}>
                  {type}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* درجة الخطورة */}
          <Form.Item
            name="severity"
            label="درجة الخطورة"
            rules={[{ required: true, message: "الرجاء اختيار درجة الخطورة" }]}
          >
            <Select placeholder="اختر درجة الخطورة">
              {severityLevels.map((level) => (
                <Select.Option key={level} value={level}>
                  {level}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* وصف تفصيلي للمخالفة */}
          <Form.Item
            name="details"
            label="وصف تفصيلي للمخالفة"
            className="md:col-span-2"
            rules={[{ required: true, message: "الرجاء كتابة الوصف" }]}
          >
            <TextArea rows={3} placeholder="اكتب التفاصيل هنا..." />
          </Form.Item>

          {/* شرح البيان من المشرف */}
          <Form.Item
            name="supervisorExplanation"
            label="شرح البيان من المشرف"
            className="md:col-span-2"
          >
            <TextArea rows={2} />
          </Form.Item>

          {/* تصوير فوري للمخالفة */}
          <Form.Item
            name="violationImage"
            label="تصوير فوري للمخالفة"
            valuePropName="fileList"
            getValueFromEvent={() => fileList}
            className="md:col-span-2"
          >
            <Upload
              beforeUpload={(file) => {
                setFileList([file]);
                return false;
              }}
              onRemove={() => setFileList([])}
              fileList={fileList}
              listType="picture"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>تحميل صورة</Button>
            </Upload>
          </Form.Item>

          {/* الإجراء */}
          <Form.Item name="action" label="الإجراء" className="md:col-span-2">
            <TextArea rows={2} />
          </Form.Item>

          {/* التوجيه */}
          <Form.Item name="guidance" label="التوجيه" className="md:col-span-2">
            <TextArea rows={2} />
          </Form.Item>

          {/* الجزاء */}
          <Form.Item
            name="penalty"
            label="الجزاء المطبق للائحة"
            className="md:col-span-2"
          >
            <TextArea rows={2} />
          </Form.Item>

          {/* التأكيدات */}
          <Form.Item name="confirmedByOps" valuePropName="checked">
            <Checkbox>التأكيد من مدير العمليات</Checkbox>
          </Form.Item>

          <Form.Item name="confirmedByMonitoring" valuePropName="checked">
            <Checkbox>التأكيد من قسم المتابعة والحفظ</Checkbox>
          </Form.Item>

          {/* زر الحفظ */}
          <Form.Item className="md:col-span-2 flex justify-center">
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              className="bg-red-600 hover:bg-red-500"
            >
              حفظ التقرير
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </>
  );
};

export default ViolationForm;
