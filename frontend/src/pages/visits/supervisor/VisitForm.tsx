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
  Modal,
} from "antd";
import { UploadOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { Visit, visitReportFieldLabels, VisitReportForm } from "@/types/visit";
import { UploadFile } from "antd/lib";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import Loading from "@/components/Loading";
import ErrorPage from "@/pages/ErrorPage";
import {
  useGetVisitQuery,
  useVisitReportMutation,
  visitsEndpoints,
} from "@/app/api/endpoints/visits";
import { useNavigate, useParams } from "react-router";
import { useAppDispatch } from "@/app/redux/hooks";
import { useNotification } from "@/providers/NotificationProvider";
import { getCurrentLocation } from "@/utils/geolocation";

interface NormalizedAttachments {
  [fieldWithAttachmentSuffix: string]: File;
}

const options = [
  { label: "جيد", value: "جيد" },
  { label: "يحتاج إلى معالجة", value: "يحتاج إلى معالجة" },
  { label: "غير متوفر", value: "غير متوفر" },
];

const VisitForm = () => {
  const { visit_id } = useParams();
  const navigate = useNavigate();

  const [form] = Form.useForm<VisitReportForm>();
  const [fieldStatus, setFieldStatus] = useState<Record<string, string>>({});
  const [attachments, setAttachments] = useState<Record<string, UploadFile[]>>(
    {}
  );
  const [showPermissionModal, setShowPermissionModal] =
    useState<boolean>(false);
  const [modalmessage, setModalmessage] = useState("");
  const [skipLocation, setSkipLocation] = useState(false);

  const handleStatusChange = (field: string, value: string) => {
    setFieldStatus((prev) => {
      const newStatus = { ...prev, [field]: value };

      if (["جيد", "غير متوفر"].includes(value)) {
        const newAttachments = { ...attachments };

        delete newAttachments[field];
        setAttachments(newAttachments);
      }

      return newStatus;
    });
  };

  const handleUploadChange = (field: string, info: any) => {
    setAttachments((prev) => ({
      ...prev,
      [field]: info.fileList,
    }));
  };

  const dispatch = useAppDispatch();
  const notification = useNotification();

  const {
    data: visit,
    isFetching,
    isError,
    error: visitError,
  } = useGetVisitQuery(visit_id as string);

  const [submitForm, { isSuccess, isError: submitError, isLoading }] =
    useVisitReportMutation();

  // normalize attachments
  const normalizeAttachments = (
    attachments: Record<string, UploadFile[]>
  ): NormalizedAttachments => {
    const result: NormalizedAttachments = {};

    Object.entries(attachments).forEach(([key, fileList]) => {
      const file = fileList?.[0];
      if (file) {
        result[`${key}_attachment`] = file.originFileObj as File;
      }
    });

    return result;
  };

  const handleFinish = async (values: VisitReportForm) => {
    let coords;

    try {
      coords = (await getCurrentLocation()).coords;
    } catch (err) {
      if (!skipLocation) {
        if (err instanceof GeolocationPositionError && err.PERMISSION_DENIED) {
          setModalmessage(
            "لم يتم تفعيل صلاحية تحديد الموقع. هل ترغب بالمتابعة على أي حال؟"
          );
          setShowPermissionModal(true);
        } else {
          setModalmessage(
            "لم يتم الحصول على بيانات تحديد الموقع. هل ترغب بالمتابعة على أي حال؟"
          );
        }
        return;
      }
    }

    const data = {
      ...values,
      visit: visit_id!,
      ...normalizeAttachments(attachments),
      latitude: coords?.latitude,
      longitude: coords?.longitude,
      location_accuracy: coords?.accuracy,
    };

    submitForm(data);
  };

  useEffect(() => {
    if (isSuccess) {
      dispatch(
        visitsEndpoints.util.updateQueryData(
          "getVisit",
          visit_id!,
          (draft: Visit) => {
            draft.status = "مكتملة";
          }
        )
      );
      notification.success({
        message: "تم حفظ بيانات الزيارة",
      });

      navigate("/supervisor/visits/");
    }
  }, [isSuccess]);

  useEffect(() => {
    if (submitError) {
      notification.error({
        message: "حدث خطأ أثناء حفظ بيانات الزيارة ! برجاء إعادة المحاولة",
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
            <span dir="rtl">{visit?.date}</span>
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
          <Form form={form} layout="vertical" onFinish={handleFinish}>
            <Row gutter={[16, 16]}>
              {Object.entries(visitReportFieldLabels).map(([field, label]) => (
                <Col xs={24} key={field}>
                  <Card
                    title={
                      <span className="text-lg font-semibold">{label}</span>
                    }
                    variant="outlined"
                    className="shadow-sm"
                  >
                    <Form.Item
                      name={field}
                      rules={[
                        { required: true, message: "الرجاء اختيار تقييم" },
                      ]}
                    >
                      <Radio.Group
                        optionType="button"
                        buttonStyle="solid"
                        options={options}
                        onChange={(e) =>
                          handleStatusChange(field, e.target.value)
                        }
                      />
                    </Form.Item>

                    {fieldStatus[field] === "يحتاج إلى معالجة" && (
                      <div className="space-y-4 mt-4">
                        <Form.Item
                          name={`${field}_notes`}
                          label="ملاحظة إضافية"
                          rules={[
                            { required: true, message: "إضافة ملاحظة إلزامية" },
                            { max: 300, message: "الحد الأقصى 300 حرف" },
                          ]}
                        >
                          <Input.TextArea
                            rows={2}
                            placeholder="أدخل الملاحظة..."
                          />
                        </Form.Item>

                        <Form.Item
                          name={`${field}_attachment`}
                          label="إرفاق صورة"
                          valuePropName="fileList"
                          getValueFromEvent={(e) =>
                            Array.isArray(e) ? e : e?.fileList
                          }
                          rules={[
                            {
                              required: true,
                              validator: (_, value) =>
                                value && value.length > 0
                                  ? Promise.resolve()
                                  : Promise.reject(
                                      new Error("إرفاق صورة إلزامي")
                                    ),
                            },
                          ]}
                        >
                          <Upload
                            beforeUpload={() => false}
                            onChange={(info) => handleUploadChange(field, info)}
                            fileList={attachments[field] || []}
                            accept="image/*"
                            maxCount={1}
                          >
                            <Button icon={<UploadOutlined />}>
                              تحميل صورة
                            </Button>
                          </Upload>
                        </Form.Item>
                      </div>
                    )}
                  </Card>
                </Col>
              ))}

              <Col span={24}>
                <Card
                  title={
                    <span className="text-lg font-semibold">
                      ملاحظات إضافية
                    </span>
                  }
                  bordered
                  className="shadow-sm"
                >
                  <Form.Item
                    name="client_notes"
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

                  <Form.Item
                    name="supervisor_notes"
                    label={<span className="text-base">ملاحظات المشرف</span>}
                    rules={[{ max: 500, message: "الحد الأقصى 500 حرف" }]}
                  >
                    <Input.TextArea
                      rows={4}
                      placeholder="أدخل ملاحظات المشرف..."
                      className="text-base"
                    />
                  </Form.Item>
                </Card>
              </Col>

              <Col span={24}>
                <Form.Item className="flex justify-center">
                  <Button
                    type="primary"
                    htmlType="submit"
                    className="w-full md:w-auto"
                    size="large"
                    loading={isLoading}
                  >
                    حفظ بيانات الزيارة
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        )}
      </Card>

      <Modal
        title="تنبيه"
        open={showPermissionModal}
        onOk={() => {
          setSkipLocation(true);
          setShowPermissionModal(false);
        }}
        onCancel={() => {
          setShowPermissionModal(false);
        }}
        centered
        okText="متابعة على أي حال"
        cancelText="إلغاء"
      >
        <p style={{ textAlign: "center", fontSize: "16px" }}>{modalmessage}</p>
      </Modal>
    </>
  );
};

export default VisitForm;
