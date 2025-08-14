import React, { useEffect, useState } from "react";
import {
  Card,
  Form,
  Select,
  Radio,
  Button,
  DatePicker,
  Table,
  Typography,
  Spin,
  Statistic,
} from "antd";
import {
  CheckCircleOutlined,
  LoadingOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { useGetProjectsQuery } from "@/app/api/endpoints/projects";
import { useLazyGetLocationsQuery } from "@/app/api/endpoints/locations";
import ErrorPage from "@/pages/ErrorPage";
import Loading from "../Loading";
import { useLazyGetShiftAttendanceQuery } from "@/app/api/endpoints/attendance";
import { useNotification } from "@/providers/NotificationProvider";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";

const { Title } = Typography;

const columns = [
  {
    title: "الرقم الوظيفي",
    dataIndex: "employee_id",
    name: "employee_id",
  },
  {
    title: "حارس الأمن",
    dataIndex: "name",
    key: "name",
  },
  {
    title: "الحالة",
    dataIndex: "status",
    key: "status",
  },
  {
    title: "ملاحظات",
    dataIndex: "notes",
    key: "notes",
    render: (text: string) => text || "-",
  },
];

const AttendanceSummary: React.FC = () => {
  const [form] = Form.useForm();
  const [projectId, setProjectId] = useState<number | null>(null);
  const [noAttendance, setNoAttendance] = useState(false);

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
            <Radio.Group className="flex">
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
      {!noAttendance && shiftAttendance && (
        <Card title="ملخص الحضور" className="shadow-md">
          {/* total scurity guards */}
          <div
            className="bg-blue-50 border border-blue-200 rounded-md p-4 flex items-center 
          gap-4 text-blue-800 shadow-sm w-full sm:max-w-xs mb-10 mx-auto"
          >
            <TeamOutlined className="text-2xl text-blue-600" />
            <Statistic
              title={
                <span className="text-sm text-blue-800">إجمالي رجال الأمن</span>
              }
              value={shiftAttendance.records.length}
              valueStyle={{ color: "#1e40af", fontWeight: 600 }}
            />
          </div>

          {/* shift attendanc data */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div>
              <Title level={5}>نسبة الحضور</Title>
              <PieChart width={300} height={300}>
                <Pie
                  data={shiftAttendance?.stats || []}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label
                >
                  {shiftAttendance?.stats?.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </div>

            {/* Table */}
            <div>
              <Title level={5}>تفاصيل الحضور</Title>
              <Table
                columns={columns}
                dataSource={shiftAttendance?.records}
                rowKey={"id"}
                pagination={false}
                className="calypso-header"
                scroll={{ x: "max-content" }}
              />
            </div>
          </div>

          {/* timestamp */}
          <div
            className="bg-green-50 border border-green-200 rounded-md p-4 
          flex items-center gap-3 text-green-800 shadow-sm mt-10"
          >
            <CheckCircleOutlined className="text-xl" />
            <span className="text-sm sm:text-base font-medium">
              تم تسجيل الحضور في
              <span className="mx-1 font-bold">
                {shiftAttendance.created_at}
              </span>
            </span>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AttendanceSummary;
