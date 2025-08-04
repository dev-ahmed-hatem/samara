import {
  Form,
  Radio,
  Upload,
  Input,
  Button,
  Row,
  Col,
  Card,
  Descriptions,
  Tag,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Visit, visitReportFieldLabels, VisitReportForm } from "@/types/visit";
import { UploadFile } from "antd/lib";
import { RcFile } from "antd/lib/upload";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import Loading from "@/components/Loading";
import ErrorPage from "@/pages/ErrorPage";
import {
  useVisitQuery,
  useVisitReportMutation,
  visitsEndpoints,
} from "@/app/api/endpoints/visits";
import { useNavigate, useParams } from "react-router";
import { dayjs } from "@/utils/locale";
import { useAppDispatch } from "@/app/redux/hooks";
import { useNotification } from "@/providers/NotificationProvider";

const options = [
  { label: "جيد", value: "جيد" },
  { label: "يحتاج إلى معالجة", value: "يحتاج إلى معالجة" },
];

const VisitForm = () => {
  const { visit_id } = useParams();
  const navigate = useNavigate();

  const [form] = Form.useForm<VisitReportForm>();
  const [fileList, setFileList] = useState<RcFile[]>([]);

  const dispatch = useAppDispatch();
  const notification = useNotification();

  const {
    data: visit,
    isFetching,
    isError,
    error: visitError,
  } = useVisitQuery(visit_id as string);

  const [submitForm, { isSuccess, isError: submitError, isLoading }] =
    useVisitReportMutation();

  const handleFinish = (values: VisitReportForm) => {
    const data = {
      ...values,
      visit: visit_id!,
    };

    if (fileList?.length) {
      data["attachment"] = fileList[0];
    }

    submitForm(data);
  };

  const handleUploadChange = ({ fileList }: any) => {
    setFileList(fileList.map((file: UploadFile) => file.originFileObj));
  };

  useEffect(() => {
    if (isSuccess) {
      dispatch(
        visitsEndpoints.util.updateQueryData(
          "visit",
          visit_id!,
          (draft: Visit) => {
            draft.status = "مكتملة";
          }
        )
      );
      notification.success({
        message: "تم إرسال النموذج",
      });

      navigate("/supervisor/visits/");
    }
  }, [isSuccess]);

  useEffect(() => {
    if (submitError) {
      notification.error({
        message: "حدث خطأ أثناء إرسال النموذج ! برجاء إعادة المحاولة",
      });
    }
  }, [submitError]);

  if (isFetching) return <Loading />;
  if (isError) {
    let title, subtitle;
    if ((visitError as axiosBaseQueryError).status === 404) {
      subtitle = "زيارة غير موجودة! تأكد من كود الزيارة المدخل.";
    } else if ((visitError as axiosBaseQueryError).status === 403) {
      title = "زيارة محجوبة";
      subtitle = (visitError as axiosBaseQueryError).data.detail;
    } else {
      subtitle = undefined;
    }

    return (
      <ErrorPage
        title={title}
        subtitle={subtitle}
        reload={subtitle === undefined}
      />
    );
  }

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

      {/* Visit Comments */}
      <Card title="ملاحظات أثناء الزيارة" className="p-4 mx-auto">
        {visit!.status == "مكتملة" ? (
          <Tag className="text-lg" color="green">
            تم تسجيل الملاحظات لهذه الزيارة
          </Tag>
        ) : (
          <Form
            form={form}
            layout="vertical"
            onFinish={handleFinish}
            initialValues={{}}
          >
            <Row gutter={[16, 16]}>
              {Object.entries(visitReportFieldLabels).map(([name, label]) => (
                <Col xs={24} sm={24} key={name}>
                  <Form.Item
                    name={name as keyof VisitReportForm}
                    label={<span className="text-base">{label}</span>}
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
                  label={
                    <span className="text-base">صورة مرفقة (اختياري)</span>
                  }
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
                    maxCount={1}
                  >
                    <Button icon={<UploadOutlined />}>تحميل صورة</Button>
                  </Upload>
                </Form.Item>
              </Col>

              <Col span={24}>
                <Form.Item
                  name="notes"
                  label={
                    <span className="text-base">
                      توجيهات أو توصيات من العميل
                    </span>
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
                    loading={isLoading}
                  >
                    إرسال النموذج
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Card>
    </>
  );
};

export default VisitForm;
