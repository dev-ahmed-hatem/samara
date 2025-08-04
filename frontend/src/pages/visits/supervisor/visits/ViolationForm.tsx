import {
  Form,
  Input,
  Select,
  Checkbox,
  Upload,
  Button,
  Card,
  Descriptions,
  Tag,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { RcFile, UploadFile } from "antd/lib/upload";
import {
  useViolationMutation,
  useVisitQuery,
  visitsEndpoints,
} from "@/app/api/endpoints/visits";
import { useNavigate, useParams } from "react-router";
import dayjs from "dayjs";
import Loading from "@/components/Loading";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import ErrorPage from "@/pages/ErrorPage";
import { useAppDispatch } from "@/app/redux/hooks";
import { useNotification } from "@/providers/NotificationProvider";
import { ViolationForm as ViolationFormType, Visit } from "@/types/visit";

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
  const { visit_id } = useParams();
  const navigate = useNavigate();

  const [form] = Form.useForm<ViolationFormType>();
  const [fileList, setFileList] = useState<RcFile[]>([]);

  const dispatch = useAppDispatch();
  const notification = useNotification();

  const {
    data: visit,
    isFetching,
    isError,
    error: visitError,
  } = useVisitQuery(visit_id as string);

  const handleSubmit = (values: any) => {
    const data = {
      ...values,
      visit: visit_id!,
    };

    if (fileList?.length) {
      data["violation_image"] = fileList[0];
    }

    submitForm(data);
  };

  const handleUploadChange = ({ fileList }: any) => {
    setFileList(fileList.map((file: UploadFile) => file.originFileObj));
  };

  const [submitForm, { isSuccess, isError: submitError, isLoading }] =
    useViolationMutation();

  useEffect(() => {
    if (isSuccess) {
      dispatch(
        visitsEndpoints.util.updateQueryData(
          "visit",
          visit_id!,
          (draft: Visit) => {
            draft.violation = "checked"; // set any string to checked as reported
          }
        )
      );

      notification.success({
        message: "تم تسجيل المخالفة",
      });

      navigate("/supervisor/visits/");
    }
  }, [isSuccess]);

  useEffect(() => {
    if (submitError) {
      notification.error({
        message: "حدث خطأ أثناء تسجيل المخالفة ! برجاء إعادة المحاولة",
      });
    }
  }, [submitError]);

  if (isFetching) return <Loading />;
  if (isError) {
    let error_title;
    if ((visitError as axiosBaseQueryError).status === 404) {
      error_title = "زيارة غير موجودة! تأكد من كود الزيارة المدخل.";
    } else if ((visitError as axiosBaseQueryError).status === 403) {
      error_title = (visitError as axiosBaseQueryError).data.detail;
    } else {
      error_title = undefined;
    }

    return (
      <ErrorPage subtitle={error_title} reload={error_title === undefined} />
    );
  }

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
          <Descriptions.Item label="رقم الزيارة">
            #{visit?.id}
          </Descriptions.Item>
          <Descriptions.Item label="التاريخ">
            {dayjs(visit?.date, "DD/MM/YYYY").format("YYYY-MM-DD")}
          </Descriptions.Item>
          <Descriptions.Item label="الوقت">{visit?.time}</Descriptions.Item>
          <Descriptions.Item label="الموقع" span={2}>
            {visit?.location.name}
          </Descriptions.Item>
          <Descriptions.Item label="إحداثيات GPS">
            {/* <div className="flex items-center gap-2">
              <Button
                size="small"
                type="link"
                href="https://www.google.com/maps?q=24.7136,46.6753"
                target="_blank"
                rel="noopener noreferrer"
              >
                24.7136°N, 46.6753°E
              </Button>
            </div> */}
            -
          </Descriptions.Item>

          {/* Purpose on its own full row */}
          <Descriptions.Item label="الهدف من الزيارة" span={2}>
            {visit?.purpose}
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
            {visit?.location.project_name}
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
        {visit!.violation !== null ? (
          <Tag className="text-lg" color="red ">
            تم تسجيل مخالفة لهذة الزيارة
          </Tag>
        ) : (
          <Form
            layout="vertical"
            form={form}
            onFinish={handleSubmit}
            className="grid grid-cols-1 md:grid-cols-2 gap-4"
          >
            {/* نوع المخالفة */}
            <Form.Item
              className="text-base"
              name="violation_type"
              label={<span className="text-base">نوع المخالفة</span>}
              rules={[
                { required: true, message: "الرجاء اختيار نوع المخالفة" },
              ]}
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
              className="text-base"
              name="severity"
              label={<span className="text-base">درجة الخطورة</span>}
              rules={[
                { required: true, message: "الرجاء اختيار درجة الخطورة" },
              ]}
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
              label={<span className="text-base">وصف تفصيلي للمخالفة</span>}
              className="md:col-span-2"
              rules={[{ required: true, message: "الرجاء كتابة الوصف" }]}
            >
              <TextArea rows={3} placeholder="اكتب التفاصيل هنا..." />
            </Form.Item>

            {/* شرح البيان من المشرف */}
            <Form.Item
              name="supervisor_explanation"
              label={<span className="text-base">شرح البيان من المشرف</span>}
              className="md:col-span-2"
            >
              <TextArea rows={2} />
            </Form.Item>

            {/* تصوير فوري للمخالفة */}
            <Form.Item
              name="violation_image"
              label={<span className="text-base">تصوير فوري للمخالفة</span>}
              className="md:col-span-2"
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
                maxCount={1}
              >
                <Button icon={<UploadOutlined />}>تحميل صورة</Button>
              </Upload>
            </Form.Item>

            {/* الإجراء */}
            <Form.Item
              name="action"
              label={<span className="text-base">الإجراء</span>}
              className="md:col-span-2"
            >
              <TextArea rows={2} />
            </Form.Item>

            {/* التوجيه */}
            <Form.Item
              name="guidance"
              label={<span className="text-base">التوجيه</span>}
              className="md:col-span-2"
            >
              <TextArea rows={2} />
            </Form.Item>

            {/* الجزاء */}
            <Form.Item
              name="penalty"
              label={<span className="text-base">الجزاء المطبق للائحة</span>}
              className="md:col-span-2"
            >
              <TextArea rows={2} />
            </Form.Item>

            {/* التأكيدات */}
            <Form.Item name="confirmed_by_ops" valuePropName="checked">
              <Checkbox className="text-base">
                التأكيد من مدير العمليات
              </Checkbox>
            </Form.Item>

            <Form.Item name="confirmed_by_monitoring" valuePropName="checked">
              <Checkbox className="text-base">
                التأكيد من قسم المتابعة والحفظ
              </Checkbox>
            </Form.Item>

            {/* زر الحفظ */}
            <Form.Item className="md:col-span-2 flex justify-center text-base">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="bg-red-600 hover:bg-red-500"
                loading={isLoading}
              >
                حفظ التقرير
              </Button>
            </Form.Item>
          </Form>
        )}
      </Card>
    </>
  );
};

export default ViolationForm;
