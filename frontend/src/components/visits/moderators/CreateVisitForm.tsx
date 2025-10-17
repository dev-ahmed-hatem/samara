import { useEffect, useState } from "react";
import {
  Form,
  Select,
  TimePicker,
  Input,
  Button,
  Spin,
  Radio,
  Typography,
  DatePicker,
  Col,
  Row,
} from "antd";
import "dayjs/locale/ar";
import { useGetProjectsQuery } from "@/app/api/endpoints/projects";
import { useLazyGetLocationsQuery } from "@/app/api/endpoints/locations";
import Loading from "@/components/Loading";
import { LoadingOutlined } from "@ant-design/icons";
import { useVisitMutation } from "@/app/api/endpoints/visits";
import api from "@/app/api/apiSlice";
import { useNotification } from "@/providers/NotificationProvider";
import { useAppDispatch } from "@/app/redux/hooks";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import { useGetEmployeesQuery } from "@/app/api/endpoints/employees";
import ErrorPage from "@/pages/ErrorPage";
import { Employee } from "@/types/employee";
import { dayjs } from "@/utils/locale";
import { Dayjs } from "dayjs";
import { Project } from "@/types/project";
import { VisitFormData } from "@/types/visit";
import { useNavigate } from "react-router";

const { Option } = Select;
const { TextArea } = Input;
const { Title } = Typography;

const checkTimeRange = (time: Dayjs): "morning" | "evening" => {
  const start = dayjs("09:00", "HH:mm");
  const end = dayjs("20:59", "HH:mm");

  return time.isAfter(start) && time.isBefore(end) ? "morning" : "evening";
};

const CreateVisitForm = ({ visitData }: { visitData?: VisitFormData }) => {
  const [initialValues, setInitialValues] = useState<VisitFormData | undefined>(
    visitData
  );
  const [projectId, setProjectId] = useState<number | null>(
    initialValues ? initialValues.project : null
  );
  const notification = useNotification();
  const dispatch = useAppDispatch();

  const [period, setPeriod] = useState<"morning" | "evening" | null>(
    initialValues ? checkTimeRange(dayjs(initialValues.time, "HH:mm")) : null
  );

  const [form] = Form.useForm();
  const navigate = useNavigate();

  const {
    data: supervisors,
    isFetching: fetchingSupervisors,
    isError: supervisorsError,
  } = useGetEmployeesQuery({ no_pagination: true, role: "supervisor" });
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
    createVisit,
    {
      isLoading: loadingVisit,
      isError: visitIsError,
      error: visitError,
      isSuccess: visitDone,
    },
  ] = useVisitMutation();

  const handleFinish = (values: any) => {
    const data = {
      ...values,
      time: values.time.format("HH:mm"),
      date: values.date.format("YYYY-MM-DD"),
      status: "مجدولة",
    };

    createVisit({
      data,
      method: initialValues ? "PATCH" : "POST",
      url: initialValues
        ? `/visits/visits/${initialValues.id}/`
        : "/visits/visits/",
    });
  };

  useEffect(() => {
    form.setFieldValue("time", undefined);
  }, [period]);

  useEffect(() => {
    if (projectId) {
      getLocations({ project_id: projectId });
    }
  }, [projectId]);

  useEffect(() => {
    if (visitDone) {
      dispatch(
        api.util.invalidateTags([
          { type: "DailyRecord", id: "LIST" },
          { type: "MonthlyRecord", id: "LIST" },
        ])
      );
      notification.success({
        message: `تم 
            ${initialValues ? "تعديل" : "إضافة"} الزيارة`,
      });
      setInitialValues(undefined);
    }
  }, [visitDone]);

  useEffect(() => {
    if (visitIsError) {
      const error = visitError as axiosBaseQueryError;
      if (error.data.non_field_errors) {
        form.setFields([
          {
            name: "location",
            errors: ["يوجد زيارة لهذا الموقع في اليوم المحدد بنفس التوقيت"],
          },
          {
            name: "time",
            errors: ["يوجد زيارة لهذا الموقع في اليوم المحدد بنفس التوقيت"],
          },
        ]);
      }
      notification.error({
        message: `حدث خطأ أثناء ${initialValues ? "تعديل" : "إضافة"} الزيارة`,
      });
    }
  }, [visitIsError]);

  // manually set time in edit mode
  useEffect(() => {
    if (initialValues) {
      form.setFieldValue("time", dayjs(initialValues.time, "HH:mm"));
    } else {
      form.resetFields();
    }
  }, [initialValues]);

  if (fetchingSupervisors || fetchingProjects) return <Loading />;
  if (supervisorsError || ProjectsError || locationsError) return <ErrorPage />;

  return (
    <div>
      <Title level={4} className="mb-4">
        {initialValues ? "تعديل" : "إضافة"} زيارة
      </Title>

      <Form
        layout="vertical"
        form={form}
        onFinish={handleFinish}
        initialValues={{
          ...initialValues,
          period,
          date: initialValues ? dayjs(initialValues.date) : undefined,
          time: initialValues?.time
            ? dayjs(initialValues.time, "hh:mm A")
            : undefined,
        }}
      >
        <Row gutter={[16, 16]}>
          {/* Supervisor */}
          <Col xs={24} md={12}>
            <Form.Item
              label="المشرف"
              name="employee"
              rules={[{ required: true, message: "يرجى اختيار المشرف" }]}
            >
              <Select placeholder="اختر المشرف" className="w-full">
                {(supervisors as Employee[])?.map((sup) => (
                  <Option key={sup.id} value={sup.id}>
                    {sup.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Project */}
          <Col xs={24} md={12}>
            <Form.Item
              label="المشروع"
              name="project"
              rules={[{ required: true, message: "يرجى اختيار المشروع" }]}
            >
              <Select
                placeholder="اختر المشروع"
                onChange={(value) => {
                  setProjectId(value);
                  form.setFieldValue("location", undefined);
                }}
              >
                {(projects as Project[])?.map((project) => (
                  <Option key={project.id} value={project.id}>
                    {project.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Location */}
          <Col xs={24} md={12}>
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
              rules={[{ required: true, message: "الرجاء اختيار الموقع" }]}
            >
              <Select placeholder="اختر الموقع" disabled={!projectId}>
                {projectId &&
                  locations?.map((loc) => (
                    <Option key={loc.id} value={loc.id}>
                      {loc.name}
                    </Option>
                  ))}
              </Select>
            </Form.Item>
          </Col>

          {/* Date */}
          <Col xs={24} md={12}>
            <Form.Item
              label="التاريخ"
              name="date"
              rules={[{ required: true, message: "يرجى اختيار تاريخ الزيارة" }]}
            >
              <DatePicker className="w-full" format="YYYY-MM-DD" />
            </Form.Item>
          </Col>

          {/* Period */}
          <Col xs={24} md={12}>
            <Form.Item
              name="period"
              label="الفترة"
              rules={[{ required: true, message: "يرجى اختيار الفترة" }]}
            >
              <Radio.Group
                className="flex"
                onChange={(e) => {
                  setPeriod(e.target.value);
                  // optional: clear time when period changes to force re-pick
                  form.setFieldValue("time", null);
                  form.validateFields(["time"]).catch(() => null);
                }}
              >
                <Radio.Button value="morning">صباحية</Radio.Button>
                <Radio.Button value="evening">مسائية</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>

          {/* Time */}
          <Col xs={24} md={12}>
            <Form.Item
              label="الوقت"
              name="time"
              dependencies={["period"]} // re-validate when period changes
              rules={[
                { required: true, message: "يرجى اختيار الوقت" },
                {
                  validator: (_, value) => {
                    const p = form.getFieldValue("period");
                    if (!value || !p) return Promise.resolve();

                    const hour = value.hour();
                    if (p === "morning") {
                      return hour >= 9 && hour < 21
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error("الوقت خارج الفترة الصباحية (9 ص - 9 م)")
                          );
                    }
                    if (p === "evening") {
                      return hour >= 21 || hour < 9
                        ? Promise.resolve()
                        : Promise.reject(
                            new Error("الوقت خارج الفترة المسائية (9 م - 9 ص)")
                          );
                    }
                    return Promise.resolve();
                  },
                },
              ]}
            >
              <TimePicker
                use12Hours
                showSecond={false}
                format={(value) =>
                  value.format("hh:mm") + (value.hour() >= 12 ? " م" : " ص")
                }
                className="w-full"
                disabled={!period}
              />
            </Form.Item>
          </Col>

          {/* Purpose (full width) */}
          <Col xs={24}>
            <Form.Item
              label="الغرض من الزيارة"
              name="purpose"
              rules={[{ required: true, message: "يرجى كتابة الغرض" }]}
            >
              <TextArea rows={3} placeholder="أدخل الغرض من الزيارة" />
            </Form.Item>
          </Col>

          {/* Submit (full width) */}
          <Col xs={24} className="flex justify-center">
            <Form.Item className="mb-0">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                loading={loadingVisit}
              >
                {initialValues ? "تعديل" : "إضافة"}
              </Button>
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default CreateVisitForm;
