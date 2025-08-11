import { useEffect, useState } from "react";
import { Form, Select, TimePicker, Input, Button, Card, Spin } from "antd";
import dayjs from "dayjs";
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

const { Option } = Select;
const { TextArea } = Input;

const CreateVisitForm = ({
  selectedSupervisor,
  selectedDate,
}: {
  selectedSupervisor: string;
  selectedDate: string;
}) => {
  const [projectId, setProjectId] = useState<number | null>(null);
  const notification = useNotification();
  const dispatch = useAppDispatch();

  const [form] = Form.useForm();

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
      employee: selectedSupervisor,
      date: selectedDate,
      ...values,
      time: values.time.format("HH:mm"),
      status: "مجدولة",
    };

    createVisit({ data });
  };

  useEffect(() => {
    if (projectId) {
      getLocations({ project_id: projectId });
    }
  }, [projectId]);

  useEffect(() => {
    if (visitDone) {
      dispatch(api.util.invalidateTags([{ type: "DailyRecords", id: "LIST" }]));
      notification.success({ message: "تم إضافة الزيارة" });
    }
  }, [visitDone]);

  useEffect(() => {
    if (visitIsError) {
      const error = visitError as axiosBaseQueryError;
      if (error.data.non_field_errors) {
        form.setFields([
          {
            name: "location",
            errors: ["يوجد زيارة لهذا الموقع في اليوم المحدد"],
          },
        ]);
      }
      notification.error({ message: "حدث خطأ أثناء إضافة الزيارة" });
    }
  }, [visitIsError]);

  if (fetchingProjects) return <Loading />;
  if (ProjectsError || locationsError)
    return (
      <p className="text-red-600 text-base">حدث خطأ أثناء تحميل المشاريع!</p>
    );

  return (
    <Card className="shadow-md rounded-xl">
      <Form
        layout="vertical"
        form={form}
        onFinish={handleFinish}
        initialValues={{ time: dayjs().hour(9).minute(0) }}
      >
        {/* Project */}
        <Form.Item
          label="المشروع"
          rules={[{ required: true, message: "يرجى اختيار المشروع" }]}
        >
          <Select
            placeholder="اختر المشروع"
            onChange={(value) => {
              setProjectId(value);
              form.setFieldValue("location", undefined);
            }}
          >
            {projects!.map((project) => (
              <Option key={project.id} value={project.id}>
                {project.name}
              </Option>
            ))}
          </Select>
        </Form.Item>

        {/* Location */}
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
                <Select.Option key={loc.id} value={loc.id}>
                  {loc.name}
                </Select.Option>
              ))}
          </Select>
        </Form.Item>

        {/* Time */}
        <Form.Item
          label="الوقت"
          name="time"
          rules={[{ required: true, message: "يرجى اختيار الوقت" }]}
        >
          <TimePicker use12Hours format="h:mm A" className="w-full" />
        </Form.Item>

        {/* Purpose */}
        <Form.Item
          label="الغرض من الزيارة"
          name="purpose"
          rules={[{ required: true, message: "يرجى كتابة الغرض" }]}
        >
          <TextArea rows={3} placeholder="أدخل الغرض من الزيارة" />
        </Form.Item>

        {/* Submit */}
        <Form.Item className="flex justify-center">
          <Button
            type="primary"
            htmlType="submit"
            size="large"
            loading={loadingVisit}
          >
            إنشاء الزيارة
          </Button>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default CreateVisitForm;
