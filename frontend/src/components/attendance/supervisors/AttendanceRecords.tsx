import React, { useEffect, useState } from "react";
import { Card, Select, Form, Input, Button, Radio, Table, Spin } from "antd";
import type { RadioChangeEvent } from "antd";
import { LoadingOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import { EmployeeAttendance, ShiftType } from "@/types/attendance";
import { useGetProjectsQuery } from "@/app/api/endpoints/projects";
import { useLazyGetLocationsQuery } from "@/app/api/endpoints/locations";
import Loading from "../../Loading";
import ErrorPage from "@/pages/ErrorPage";
import { useLazyGetSecurityGuardsQuery } from "@/app/api/endpoints/security_guards";
import {
  useLazyGetProjectAttendancesQuery,
  useShiftAttendanceMutation,
} from "@/app/api/endpoints/attendance";
import { useNotification } from "@/providers/NotificationProvider";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import { SecurityGuard } from "@/types/scurityGuard";
import { Project } from "@/types/project";
import AttendanceAccordion from "./AttendanceAccordion";

const today = dayjs().format("YYYY-MM-DD");
const yesterday = dayjs().subtract(1, "day").format("YYYY-MM-DD");

const AttendanceRecords: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(today);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [shift, setShift] = useState<ShiftType | null>(null);
  const [attendance, setAttendance] = useState<
    Record<number, EmployeeAttendance>
  >({});
  const [guards, setGuards] = useState<SecurityGuard[] | null>(null);
  const [previouslyRecorded, setPreviouslyRecorded] = useState<boolean>(false);
  const [form] = Form.useForm();
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
    getSecurityGuards,
    {
      data: securityGuards,
      isFetching: fetchingSecurityGuards,
      error: securityGuardsError,
      isError: securityGuardsIsError,
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
      title: "الرقم الوظيفي",
      dataIndex: "employee_id",
    },
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
          options={["حاضر", "متأخر", "غائب", "راحة"]}
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
      [id]: { ...prev[id], notes: e.target.value },
    }));
  };

  const handleSave = () => {
    if (!securityGuards) return;

    const incomplete = Object.entries(attendance).filter(
      ([_, value]) => !value.status
    );

    if (
      incomplete.length > 0 ||
      Object.entries(attendance).length <
        (securityGuards as SecurityGuard[])?.length
    ) {
      notification.error({ message: "يرجى تحديد حالة الحضور لجميع الحراس" });
      return;
    }

    const data = {
      location,
      shift,
      date: currentDate,
      records: attendance,
    };

    recordAttendance(data);
  };

  const [
    getAttendances,
    {
      data: attendances,
      isFetching: fetchingAttendances,
      isError: attendancesIsError,
    },
  ] = useLazyGetProjectAttendancesQuery();

  useEffect(() => {
    if (securityGuards) {
      setGuards(securityGuards as SecurityGuard[]);
    }
  }, [securityGuards]);

  useEffect(() => {
    if (projectId) getLocations({ project_id: projectId, is_active: "active" });
  }, [projectId]);

  useEffect(() => {
    if (location && shift) {
      getSecurityGuards({
        no_pagination: true,
        location_id: location,
        shift: shift,
        date: currentDate,
        is_active: "active",
      });
    }
  }, [currentDate, location, shift]);

  useEffect(() => {
    setAttendance({});
  }, [currentDate, projectId, shift, location]);

  useEffect(() => {
    if (projectId && currentDate) {
      getAttendances({
        date: currentDate,
        project: projectId!.toString(),
      });
    }
  }, [projectId, currentDate]);

  useEffect(() => {
    if (attendanceSaved) {
      notification.success({ message: "تم تسجيل الحضور" });
      setAttendance({});
      setGuards(null);
      setProjectId(null);
      setLocation(null);
      setShift(null);
    }
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

  useEffect(() => {
    setPreviouslyRecorded(false);
  }, [fetchingSecurityGuards]);

  useEffect(() => {
    if (securityGuardsIsError) {
      const error = securityGuardsError as axiosBaseQueryError;
      if (error.status === 409) {
        setPreviouslyRecorded(true);
      }
    }
  }, [securityGuardsIsError]);

  if (fetchingProjects) return <Loading />;
  if (
    ProjectsError ||
    locationsError ||
    (securityGuardsIsError && !previouslyRecorded)
  )
    return <ErrorPage />;

  return (
    <div className="space-y-6">
      {/* Section 1 */}
      <Card title="تفاصيل الحضور" className="shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 py-3">
          <Form
            layout="vertical"
            form={form}
            className="col-span-full md:col-span-3"
          >
            {/* Date */}
            <Form.Item label="تاريخ اليوم">
              <Radio.Group
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className="font-semibold"
                buttonStyle="solid"
              >
                <Radio.Button value={yesterday}>{yesterday}</Radio.Button>
                <Radio.Button value={today}>{today}</Radio.Button>
              </Radio.Group>
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
              <Radio.Group
                onChange={(event) => setShift(event.target.value)}
                value={shift}
                buttonStyle="solid"
              >
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

      {/* Section2 */}
      <div className="flex flex-col items-center justify-center">
        {/* Loading state */}
        {fetchingAttendances && (
          <div className="flex flex-col items-center justify-center py-10">
            <Loading className="h-36" />
          </div>
        )}

        {/* Error state */}
        {attendancesIsError && !fetchingAttendances && (
          <div className="text-center text-red-500 py-10">
            <p>حدث خطأ أثناء تحميل بيانات الحضور. يرجى المحاولة لاحقًا.</p>
          </div>
        )}

        {/* Empty state */}
        {!fetchingAttendances &&
          !attendancesIsError &&
          attendances?.attendances?.length === 0 && (
            <div className="text-center text-gray-500 py-10">
              <p>لا توجد بيانات حضور متاحة حاليًا.</p>
            </div>
          )}

        {/* Data loaded */}
        {!fetchingAttendances &&
          !attendancesIsError &&
          projectId &&
          attendances &&
          attendances.attendances.length > 0 && (
            <AttendanceAccordion attendances={attendances} />
          )}
      </div>

      {/* Section 3 */}
      {fetchingSecurityGuards ? (
        <Loading />
      ) : previouslyRecorded ? (
        <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl shadow-sm flex items-center gap-3">
          <svg
            className="w-5 h-5 text-green-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span className="text-sm md:text-base font-medium">
            تم تسجيل حضور هذه الوردية لهذا اليوم
          </span>
        </div>
      ) : guards ? (
        <Card title="حالة حراس الأمن" className="shadow-md">
          <div className="space-y-6">
            <Table
              columns={columns}
              dataSource={securityGuards as SecurityGuard[]}
              rowKey={"id"}
              pagination={false}
              className="calypso-header"
              scroll={{ x: "max-content" }}
            />
          </div>

          {/* Save Button */}
          {guards.length > 0 && (
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
          )}
        </Card>
      ) : null}
    </div>
  );
};

export default AttendanceRecords;
