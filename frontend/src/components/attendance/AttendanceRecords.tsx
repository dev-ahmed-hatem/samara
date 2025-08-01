import React, { useEffect, useState } from "react";
import {
  Card,
  Select,
  Form,
  Input,
  Button,
  Radio,
  Table,
  Spin,
} from "antd";
import type { RadioChangeEvent } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { EmployeeAttendance, ShiftType } from "@/types/attendance";
import { useGetProjectsQuery } from "@/app/api/endpoints/projects";
import { useLazyGetLocationsQuery } from "@/app/api/endpoints/locations";
import Loading from "../Loading";
import ErrorPage from "@/pages/ErrorPage";
import { useLazyGetSecurityGuardsQuery } from "@/app/api/endpoints/security_guards";
import { useShiftAttendanceMutation } from "@/app/api/endpoints/attendance";
import { useNotification } from "@/providers/NotificationProvider";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";

const AttendanceRecords: React.FC = () => {
  const currentDate = dayjs().format("YYYY-MM-DD");
  const [projectId, setProjectId] = useState<number | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [shift, setShift] = useState<ShiftType | null>(null);
  const [attendance, setAttendance] = useState<
    Record<number, EmployeeAttendance>
  >({});
  const [form] = Form.useForm();
  const notification = useNotification();

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
  const [
    recordAttendance,
    {
      isLoading: savingAttendance,
      isSuccess: attendanceSaved,
      isError: attendanceIsError,
      error: attendanceError,
    },
  ] = useShiftAttendanceMutation();

  // Table Columns
  const columns = [
    {
      title: "حارس الأمن",
      dataIndex: "name",
    },
    {
      title: "الحالة",
      dataIndex: "status",
      render: (text: string, record: any) => (
        <Radio.Group
          value={attendance[record.id]?.status}
          onChange={(e) => handleStatusChange(record.id, e)}
          options={["حاضر", "متأخر", "غائب"]}
          optionType="button"
          buttonStyle="solid"
        />
      ),
    },
    {
      title: "ملاحظات",
      dataIndex: "notes",
      render: (text: string, record: any) => (
        <Input
          className="mt-2"
          placeholder="ملاحظات"
          value={attendance[record.id]?.notes}
          onChange={(e) => handleNoteChange(record.id, e)}
        />
      ),
    },
  ];

  const handleStatusChange = (id: number, e: RadioChangeEvent) => {
    setAttendance((prev) => ({
      ...prev,
      [id]: { ...prev[id], status: e.target.value },
    }));
  };

  const handleNoteChange = (
    id: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAttendance((prev) => ({
      ...prev,
      [id]: { ...prev[id], note: e.target.value },
    }));
  };

  const handleSave = () => {
    const data = {
      location,
      shift,
      date: currentDate,
      records: attendance,
    };

    recordAttendance(data);
  };

  useEffect(() => {
    if (projectId) getLocations({ project_id: projectId });
  }, [projectId]);

  useEffect(() => {
    if (location && shift) {
      getSecurityGuards({ location_id: location, shift: shift });
    }
  }, [location, shift]);

  useEffect(() => {
    if (attendanceSaved) notification.success({ message: "تم تسجيل الحضور" });
  }, [attendanceSaved]);

  useEffect(() => {
    if (attendanceIsError) {
      const error = attendanceError as axiosBaseQueryError;
      notification.error({
        message:
          error.status === 409
            ? error.data.detail || "حدث خطأ أثناء تسجيل الحضور !"
            : "حدث خطأ أثناء تسجيل الحضور ! برجاء إعادة المحاولة",
      });
    }
  }, [attendanceIsError]);

  if (fetchingProjects) return <Loading />;
  if (ProjectsError || locationsError || securityGuardsError)
    return <ErrorPage />;

  return (
    <div className="space-y-6">
      {/* Section 1 */}
      <Card title="تفاصيل الحضور" className="shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form
            layout="vertical"
            form={form}
            className="col-span-full md:col-span-3"
          >
            {/* Date */}
            <Form.Item label="تاريخ اليوم">
              <div className="font-semibold">{currentDate}</div>
            </Form.Item>

            {/* Project Select */}
            <Form.Item label="اختر المشروع" required>
              <Select
                placeholder="اختر المشروع"
                onChange={(value) => {
                  setProjectId(value);
                  setLocation(null);
                }}
                value={projectId ?? undefined}
              >
                {projects!.map((project) => (
                  <Select.Option key={project.id} value={project.id}>
                    {project.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {/* Location Select */}
            <Form.Item
              label={
                <div className="flex gap-2 items-center">
                  <span>اختر الموقع</span>
                  {fetchingLocations && (
                    <Spin size="small" indicator={<LoadingOutlined spin />} />
                  )}
                </div>
              }
              required
            >
              <Select
                placeholder="اختر الموقع"
                onChange={(value) => setLocation(value)}
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

            {/* Shift Select */}
            <Form.Item label="اختر الوردية" required name="shift">
              <Radio.Group onChange={(event) => setShift(event.target.value)}>
                <Radio.Button value="الوردية الأولى">
                  الوردية الأولى
                </Radio.Button>
                <Radio.Button value="الوردية الثانية">
                  الوردية الثانية
                </Radio.Button>
                <Radio.Button value="الوردية الثالثة">
                  الوردية الثالثة
                </Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Form>
        </div>
      </Card>

      {/* Section 2 */}
      {fetchingSecurityGuards ? (
        <Loading />
      ) : securityGuards ? (
        <Card title="حالة حراس الأمن" className="shadow-md">
          <div className="space-y-6">
            <Table
              columns={columns}
              dataSource={securityGuards}
              rowKey={"id"}
              pagination={false}
              className="calypso-header"
              scroll={{ x: "max-content" }}
            />
          </div>

          {/* Save Button */}
          <div className="mt-6 text-end">
            <Button
              type="primary"
              onClick={handleSave}
              size="large"
              loading={savingAttendance}
            >
              حفظ
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
};

export default AttendanceRecords;
