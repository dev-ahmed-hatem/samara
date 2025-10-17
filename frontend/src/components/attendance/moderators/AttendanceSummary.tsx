import React, { useEffect } from "react";
import { Card, Form, DatePicker, Select, Button, Modal } from "antd";
import type { FormInstance } from "antd/es/form";
import { useLazyGetProjectAttendancesQuery } from "@/app/api/endpoints/attendance";
import ErrorPage from "@/pages/ErrorPage";
import Loading from "@/components/Loading";
import { useNotification } from "@/providers/NotificationProvider";
import { useGetProjectsQuery } from "@/app/api/endpoints/projects";
import SummaryModal from "./SummaryModal";
import { Project } from "@/types/project";

const AttendanceSummary: React.FC = () => {
  const notification = useNotification();
  const [form] = Form.useForm<FormInstance>();

  const {
    data: projects,
    isFetching: fetchingProjects,
    isError: ProjectsError,
  } = useGetProjectsQuery();
  const [
    getAttendances,
    {
      data: attendances,
      isFetching: fetchingAttendances,
      isError: attendancesIsError,
    },
  ] = useLazyGetProjectAttendancesQuery();

  const handleSave = (values: any) => {
    getAttendances({
      date: values.date.format("YYYY-MM-DD"),
      project: values.project,
    });
  };

  useEffect(() => {
    if (attendancesIsError) {
      notification.error({
        message: "حدث خطأ! برجاء إعادة المحاولة",
      });
    }
  }, [attendancesIsError]);
  

  if (fetchingProjects) return <Loading />;
  if (ProjectsError) return <ErrorPage />;

  return (
    <div className="space-y-6">
      {/* Filter Form */}
      <Card title="تصفية التقرير" className="shadow-md">
        <Form
          layout="vertical"
          form={form}
          onFinish={handleSave}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* Date */}
          <Form.Item
            label="اليوم"
            name="date"
            className="col-span-1"
            rules={[{ required: true, message: "الرجاء اختيار التاريخ" }]}
          >
            <DatePicker className="w-full" format="DD-MM-YYYY" />
          </Form.Item>

          {/* Project */}
          <Form.Item
            label="المشروع"
            name="project"
            className="col-span-1"
            rules={[{ required: true, message: "الرجاء اختيار المشروع" }]}
          >
            <Select placeholder="اختر المشروع">
              {(projects as Project[])?.map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          {/* Submit */}
          <Form.Item className="flex justify-center md:justify-end items-end">
            <Button
              type="primary"
              htmlType="submit"
              className="md:w-auto mx-auto"
              size="middle"
              loading={fetchingAttendances}
            >
              عرض
            </Button>
          </Form.Item>
        </Form>
      </Card>

      {fetchingAttendances && <Loading />}

      {/* Attendance Overview */}
      {!fetchingAttendances && attendances && (
        <div>
          <h2 className="text-lg font-bold mb-4">
            تسجيلات حضور المواقع - {attendances?.project} -{" "}
            <span dir="rtl">{attendances?.date}</span>
          </h2>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {attendances.attendances.map((loc, idx) => (
              <Card
                key={idx}
                className="rounded-2xl shadow-lg overflow-hidden border border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100"
              >
                {/* Card Header */}
                <div
                  className="p-4 text-white font-bold text-lg"
                  style={{ backgroundColor: "#b79237" }}
                >
                  {loc.location}
                </div>

                {/* Shifts */}
                <div className="p-4 space-y-3">
                  {Object.entries(loc.shifts).map(([shift, shiftData], i) => (
                    <div
                      key={i}
                      className="flex justify-between flex-wrap gap-2 items-center p-3 rounded-xl shadow-sm bg-white border border-gray-200"
                    >
                      <span className="font-medium text-gray-700">{shift}</span>
                      {shiftData.has_attendance ? (
                        <SummaryModal shift_id={shiftData.id!} />
                      ) : (
                        <span className="text-gray-400 text-sm">
                          لا يوجد حضور
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceSummary;
