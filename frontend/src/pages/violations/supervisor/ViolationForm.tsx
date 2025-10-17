import {
  Form,
  Input,
  Select,
  Upload,
  Button,
  Card,
  Spin,
  DatePicker,
  TimePicker,
} from "antd";
import { LoadingOutlined, UploadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { RcFile, UploadFile } from "antd/lib/upload";
import { useViolationMutation } from "@/app/api/endpoints/visits";
import { useNavigate } from "react-router";
import Loading from "@/components/Loading";
import ErrorPage from "@/pages/ErrorPage";
import { useNotification } from "@/providers/NotificationProvider";
import { ViolationForm as ViolationFormType } from "@/types/visit";
import { useGetProjectsQuery } from "@/app/api/endpoints/projects";
import { useLazyGetLocationsQuery } from "@/app/api/endpoints/locations";
import { useLazyGetSecurityGuardsQuery } from "@/app/api/endpoints/security_guards";
import { SecurityGuard } from "@/types/scurityGuard";
import { Project } from "@/types/project";

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
  const navigate = useNavigate();
  const notification = useNotification();

  const [form] = Form.useForm<ViolationFormType>();
  const [fileList, setFileList] = useState<RcFile[]>([]);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [location, setLocation] = useState<number | null>(null);

  const {
    data: projects,
    isFetching: fetchingProjects,
    isError: ProjectsError,
  } = useGetProjectsQuery();
  const [
    getLocations,
    { data: locations, isFetching: fetchingLocations, isError: locationsError },
  ] = useLazyGetLocationsQuery();
  const [
    getSecurityGuards,
    {
      data: securityGuards,
      isFetching: fetchingSecurityGuards,
      isError: securityGuardsError,
    },
  ] = useLazyGetSecurityGuardsQuery();

  const handleSubmit = (values: any) => {
    const data = {
      ...values,
      date: values.date.format("YYYY-MM-DD"),
      time: values.time.format("HH:mm"),
    };

    if (fileList?.length) {
      data["violation_image"] = fileList[0];
    }

    submitForm({ data });
  };

  const handleUploadChange = ({ fileList }: any) => {
    setFileList(fileList.map((file: UploadFile) => file.originFileObj));
  };

  const [submitForm, { isSuccess, isError: submitError, isLoading }] =
    useViolationMutation();

  useEffect(() => {
    if (isSuccess) {
      notification.success({
        message: "تم تسجيل المخالفة",
      });

      navigate("/supervisor/violations/");
    }
  }, [isSuccess]);

  useEffect(() => {
    if (submitError) {
      notification.error({
        message: "حدث خطأ أثناء تسجيل المخالفة ! برجاء إعادة المحاولة",
      });
    }
  }, [submitError]);

  useEffect(() => {
    if (projectId) {
      getLocations({ is_active: "active", project_id: projectId });
    }
  }, [projectId]);

  useEffect(() => {
    if (projectId && location) {
      getSecurityGuards({
        no_pagination: true,
        location_id: location,
      });
    }
  }, [projectId, location]);

  if (fetchingProjects) return <Loading />;
  if (ProjectsError || locationsError || securityGuardsError)
    return <ErrorPage />;

  return (
    <>
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-10 text-center text-red-600">
        الإبلاغ عن مخالفة
      </h1>

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
          <Form.Item
            label="المشروع"
            className="col-span-1"
            rules={[{ required: true, message: "الرجاء اختيار المشروع" }]}
          >
            <Select
              placeholder="اختر المشروع"
              onChange={(value) => {
                setProjectId(value);
                setLocation(null);
                form.setFieldValue("location", undefined);
              }}
            >
              {(projects as Project[])?.map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label={
              <div className="flex gap-2 items-center">
                <span>اختر الموقع</span>
                {fetchingLocations && (
                  <Spin size="small" indicator={<LoadingOutlined spin />} />
                )}
              </div>
            }
            name="location"
            className="col-span-1"
            rules={[{ required: true, message: "الرجاء اختيار الموقع" }]}
          >
            <Select
              placeholder="اختر الموقع"
              onChange={(value) => {
                setLocation(value);
              }}
              value={location ?? undefined}
              disabled={!projectId}
            >
              {projectId &&
                locations?.map((loc) => (
                  <Select.Option key={loc.id} value={loc.id}>
                    {loc.name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="التاريخ"
            name={"date"}
            rules={[{ required: true, message: "يرجى اختيار تاريخ المخالفة" }]}
          >
            <DatePicker className="w-full" format="YYYY-MM-DD" />
          </Form.Item>

          <Form.Item
            label="الوقت"
            name="time"
            rules={[{ required: true, message: "يرجى اختيار وقت المخالفة" }]}
          >
            <TimePicker use12Hours className="w-full" format="HH:mm" />
          </Form.Item>

          <Form.Item
            label={
              <div className="flex gap-2 items-center">
                <span>الموظف المخالف</span>
                {fetchingSecurityGuards && (
                  <Spin size="small" indicator={<LoadingOutlined spin />} />
                )}
              </div>
            }
            name="security_guard"
            className="col-span-1"
          >
            <Select
              placeholder="اختر الموظف المخالف"
              disabled={!location}
              allowClear
            >
              {location &&
                (securityGuards as SecurityGuard[])?.map((sec) => (
                  <Select.Option key={sec.id} value={sec.id}>
                    {sec.name}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>

          {/* نوع المخالفة */}
          <Form.Item
            className="text-base"
            name="violation_type"
            label={<span className="text-base">نوع المخالفة</span>}
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
            className="text-base"
            name="severity"
            label={<span className="text-base">درجة الخطورة</span>}
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
      </Card>
    </>
  );
};

export default ViolationForm;
