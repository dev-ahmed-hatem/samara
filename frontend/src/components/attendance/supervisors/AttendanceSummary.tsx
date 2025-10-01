import React, { useEffect, useState } from "react";
import { Card, Form, Select, Radio, Button, DatePicker, Spin } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import { useGetProjectsQuery } from "@/app/api/endpoints/projects";
import { useLazyGetLocationsQuery } from "@/app/api/endpoints/locations";
import ErrorPage from "@/pages/ErrorPage";
import Loading from "../../Loading";
import { useLazyGetShiftAttendanceQuery } from "@/app/api/endpoints/attendance";
import { useNotification } from "@/providers/NotificationProvider";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import ShiftStats from "../ShiftStats";
import { Project } from "@/types/project";

const AttendanceSummary: React.FC = () => {
  const [form] = Form.useForm();
  const [projectId, setProjectId] = useState<number | null>(null);
  const [noAttendance, setNoAttendance] = useState(false);

  const notification = useNotification();

  const {
    data: projectsRow,
    isFetching: fetchingProjects,
    isError: ProjectsError,
  } = useGetProjectsQuery({ no_pagination: true });
  const projects = projectsRow as Project[];
  const [
    getLocations,
    { data: locations, isFetching: fetchingLocations, isError: locationsError },
  ] = useLazyGetLocationsQuery();
  const [
    getShiftAttendance,
    {
      data: shiftAttendance,
      isFetching: fetchingAttendance,
      isError: attendanceIsError,
      error: attendanceError,
    },
  ] = useLazyGetShiftAttendanceQuery();

  const handleSave = (values: any) => {
    const data = {
      date: values.date.format("YYYY-MM-DD"),
      location: values.location,
      shift: values.shift,
    };
    setNoAttendance(false);
    getShiftAttendance(data);
  };

  useEffect(() => {
    if (projectId) {
      getLocations({ project_id: projectId });
    }
  }, [projectId]);

  useEffect(() => {
    if (attendanceIsError) {
      const error = attendanceError as axiosBaseQueryError;
      if (error.status === 404) {
        setNoAttendance(true);
      } else {
        notification.error({
          message: "حدث خطأ! برجاء إعادة المحاولة",
        });
      }
    }
  }, [attendanceIsError]);

  if (fetchingProjects) return <Loading />;
  if (ProjectsError || locationsError) return <ErrorPage />;

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <Card title="تصفية التقرير" className="shadow-md">
        <Form
          layout="vertical"
          form={form}
          onFinish={handleSave}
          className="grid grid-cols-1 md:grid-cols-5 gap-4"
        >
          <Form.Item
            label="اليوم"
            name="date"
            className="col-span-1"
            rules={[{ required: true, message: "الرجاء اختيار التاريخ" }]}
          >
            <DatePicker className="w-full" format="DD-MM-YYYY" />
          </Form.Item>

          <Form.Item
            label="المشروع"
            name="project"
            className="col-span-1"
            rules={[{ required: true, message: "الرجاء اختيار المشروع" }]}
          >
            <Select
              placeholder="اختر المشروع"
              onChange={(value) => {
                setProjectId(value);
                form.setFieldValue("location", undefined);
              }}
            >
              {projects!.map((p) => (
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
            label="الوردية"
            name="shift"
            className="col-span-1"
            rules={[{ required: true, message: "الرجاء اختيار الوردية" }]}
          >
            <Radio.Group className="flex" buttonStyle="solid">
              <Radio.Button value="الوردية الأولى">الأولى</Radio.Button>
              <Radio.Button value="الوردية الثانية">الثانية</Radio.Button>
              <Radio.Button value="الوردية الثالثة">الثالثة</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item className="flex justify-center md:justify-end items-end">
            <Button
              type="primary"
              htmlType="submit"
              className="md:w-auto mx-auto"
              size="middle"
              loading={fetchingAttendance}
            >
              عرض
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {noAttendance && (
        <Card title="ملخص الحضور" className="shadow-md text-red-600 text-base">
          لا يوجد سجل حضور لهذه الوردية في هذا اليوم
        </Card>
      )}

      {/* Report Section */}
      {fetchingAttendance ? (
        <Loading />
      ) : (
        !noAttendance &&
        shiftAttendance && <ShiftStats shiftAttendance={shiftAttendance} />
      )}
    </div>
  );
};

export default AttendanceSummary;
