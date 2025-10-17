import React, { useEffect, useState } from "react";
import {
  Calendar,
  Select,
  Card,
  Button,
  Tag,
  Row,
  Col,
  Typography,
  Popconfirm,
  Badge,
  Empty,
  Divider,
  Radio,
} from "antd";
import { EditOutlined, PlusOutlined } from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import dayjs from "dayjs";
import {
  useGetEmployeesQuery,
  useLazyGetSupervisorDailyRecordQuery,
  useLazyGetSupervisorMonthlyRecordQuery,
} from "@/app/api/endpoints/employees";
import ErrorPage from "@/pages/ErrorPage";
import Loading from "@/components/Loading";
import { Employee } from "@/types/employee";
import { CalendarProps } from "antd/lib";
import { useNotification } from "@/providers/NotificationProvider";
import { useNavigate } from "react-router";
import {
  useDeleteViolationMutation,
  useVisitMutation,
} from "@/app/api/endpoints/visits";
import api from "@/app/api/apiSlice";
import { useAppDispatch } from "@/app/redux/hooks";
import CreateVisitForm from "@/components/visits/moderators/CreateVisitForm";
import { Visit } from "@/types/visit";
import VisitReportModal from "../../../components/visits/moderators/VisitReportModal";
import ViolationReportModal from "@/components/violations/ViolationReportModal";
import VisitNotesModal from "@/components/visits/moderators/VisitNotesModal";

const { Option } = Select;
const { Title, Text } = Typography;

type CellColorsMapType = {
  [key in "completed" | "scheduled" | "violations"]: string;
};

const colorsMap: CellColorsMapType = {
  completed: "#52c41a",
  scheduled: "#faad14",
  violations: "",
};

const titlesMap = {
  completed: "مكتملة",
  scheduled: "مجدولة",
  violations: "مخالفات",
};

const VisitsController: React.FC = () => {
  const notification = useNotification();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [message, setMessage] = useState<string>("");

  const [selectedDate, setSelectedDate] = useState<Dayjs>(dayjs());
  const [month, setMonth] = useState<number>(dayjs().month() + 1);
  const [selectedSupervisor, setSelectedSupervisor] = useState<string | null>(
    null
  );
  const [period, setPeriod] = useState<"morning" | "evening">("morning");
  const [completed, setCompleted] = useState<Visit[]>([]);
  const [scheduled, setScheduled] = useState<Visit[]>([]);

  const {
    data: supervisors,
    isFetching: fetchingSupervisors,
    isError: supervisorsError,
  } = useGetEmployeesQuery({ no_pagination: true, role: "supervisor" });
  const [
    getRecords,
    { data: records, isFetching: fetchingRecords, isError: recordsError },
  ] = useLazyGetSupervisorMonthlyRecordQuery();
  const [
    getDaily,
    { data: daily, isFetching: fetchingDaily, isError: dailyError },
  ] = useLazyGetSupervisorDailyRecordQuery();
  const [
    handleVisit,
    { isLoading: loadingVisit, isError: visitIsError, isSuccess: visitDone },
  ] = useVisitMutation();
  const [
    deleteViolation,
    {
      isLoading: deletingViolation,
      isError: violationIsError,
      isSuccess: violationIsDone,
    },
  ] = useDeleteViolationMutation();

  const handleVisitDelete = (id: string) => {
    setMessage("تم حذف الزيارة");
    handleVisit({ url: `/visits/visits/${id}/`, method: "DELETE" });
  };

  const handleViolationDelete = (id: string) => {
    setMessage("تم حذف المخالفة");
    deleteViolation(id);
  };

  const onDateSelect = (date: Dayjs) => {
    setSelectedDate(date);
    setMonth(date.month() + 1);
  };

  const dateCellRender = (value: Dayjs) => {
    if (!records) return;
    const monthRecord = records.data[value.date()];
    if (!monthRecord) return;

    return (
      <ul>
        {Object.entries(monthRecord).map(([key, value], index) => {
          if (value === 0) return;
          return (
            <li key={index}>
              <Badge
                color={colorsMap[key as keyof CellColorsMapType]}
                count={value}
                showZero
              />
              <span className="text-sm ms-2">
                {titlesMap[key as keyof CellColorsMapType]}
              </span>
            </li>
          );
        })}
      </ul>
    );
  };

  const cellRender: CalendarProps<Dayjs>["cellRender"] = (current, info) => {
    if (current.month() + 1 !== month) return;
    if (info.type === "date") return dateCellRender(current);
    return info.originNode;
  };

  useEffect(() => {
    if (selectedSupervisor)
      getRecords({
        supervisor: selectedSupervisor,
        date: selectedDate.format("YYYY-MM-DD"),
        period,
      });
  }, [selectedSupervisor, month, period]);

  useEffect(() => {
    if (records && selectedDate && selectedSupervisor)
      getDaily({
        date: selectedDate.format("YYYY-MM-DD"),
        supervisor: selectedSupervisor,
        period,
      });
  }, [records, selectedDate, selectedSupervisor]);

  useEffect(() => {
    if (recordsError || dailyError)
      notification.error({ message: "حدث خطأ أثناء تحميل الزيارات" });
  }, [recordsError, dailyError]);

  useEffect(() => {
    if (visitDone || violationIsDone) {
      dispatch(
        api.util.invalidateTags([
          { type: "DailyRecord", id: "LIST" },
          { type: "MonthlyRecord", id: "LIST" },
        ])
      );
      notification.success({ message: message });
    }
  }, [visitDone, violationIsDone]);

  useEffect(() => {
    if (visitIsError || violationIsError) {
      notification.error({ message: "حدث خطأ أثناء التنفيذ" });
    }
  }, [visitIsError, violationIsError]);

  useEffect(() => {
    if (daily) {
      setCompleted(daily.visits.filter((v) => v.status === "مكتملة"));
      setScheduled(daily.visits.filter((v) => v.status === "مجدولة"));
    }
  }, [daily]);

  if (fetchingSupervisors) return <Loading />;
  if (supervisorsError) return <ErrorPage />;
  return (
    <div className="p-4">
      <Title level={3} className="mb-4">
        إدارة الزيارات الميدانية
      </Title>
      <Card className="shadow-lg mb-8">
        <div className="flex justify-between flex-wrap gap-6">
          <div className="w-full max-w-md space-y-6">
            <div className="flex flex-col w-full">
              <label className="mb-2 text-gray-600 font-medium text-lg">
                المشرف
              </label>
              <Select
                placeholder="اختر المشرف"
                className="w-full max-w-md"
                onChange={(value) => setSelectedSupervisor(value)}
              >
                {(supervisors as Employee[])?.map((sup) => (
                  <Option key={sup.id} value={sup.id}>
                    {sup.name}
                  </Option>
                ))}
              </Select>
            </div>

            <div className="flex flex-col w-full">
              <label className="mb-2 text-gray-600 font-medium text-lg">
                الفترة
              </label>
              <Radio.Group
                className="flex"
                onChange={(event) => setPeriod(event.target.value)}
                defaultValue={period}
                buttonStyle="solid"
              >
                <Radio.Button value="morning">صباحية</Radio.Button>
                <Radio.Button value="evening">مسائية</Radio.Button>
              </Radio.Group>
            </div>
          </div>
          <Button
            type="primary"
            size="middle"
            icon={<PlusOutlined />}
            onClick={() => navigate("add-visit")}
          >
            إضافة زيارة
          </Button>
        </div>
      </Card>

      {fetchingRecords ? (
        <Loading />
      ) : (
        records && (
          <Card className="shadow-lg mb-8">
            <Title level={4} className="mb-4">
              اختر اليوم:
            </Title>
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-4 w-full md:w-auto">
                <Calendar
                  value={selectedDate}
                  onSelect={onDateSelect}
                  className="w-full md:w-auto rtl"
                  fullscreen={true}
                  cellRender={cellRender}
                />
              </div>
            </div>
            <Divider />
          </Card>
        )
      )}

      {fetchingDaily ? (
        <Loading />
      ) : (
        daily && (
          <Row gutter={[16, 16]}>
            {/* Visits Section */}
            <Col xs={24} md={24}>
              <Title level={4} className="mb-5">
                الزيارات المكتملة ليوم {selectedDate.format("DD-MM-YYYY")}
              </Title>

              <div className="flex flex-wrap gap-4 justify-between">
                {completed.length == 0 && (
                  <Empty
                    description="لا توجد زيارات مكتملة"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    className="w-full py-10"
                  />
                )}
                {completed.map((visit) => (
                  <Card
                    styles={{
                      header: {
                        padding: 0,
                      },
                    }}
                    key={visit.id}
                    className={`w-full sm:w-[49%] lg:w-[49%] h-52 flex flex-col justify-between shadow-sm border rounded-md border-green-500`}
                    title={
                      <div className="py-2 px-3 rounded-t-md mx-0 bg-green-100">
                        {/* Row 1: Project + Location */}
                        <div className="flex items-center justify-between mb-1">
                          <Text
                            strong
                            className="truncate text-base line-clamp-1"
                          >
                            {visit.location.project_name} -{" "}
                            {visit.location.name}
                          </Text>
                          <VisitNotesModal
                            visit_id={visit.id}
                            value={visit.notes}
                            disabled={loadingVisit}
                          />
                        </div>

                        {/* Row 2: Date + Time on left, Status on right */}
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-xs text-gray-700">
                            <span dir="rtl">{visit.date}</span>
                            <span>{visit.time}</span>
                          </div>
                          <Tag color="green" className="text-sm">
                            {visit.status}
                          </Tag>
                        </div>
                      </div>
                    }
                  >
                    <Text type="secondary" className="text-sm line-clamp-2">
                      {visit.purpose}
                    </Text>
                    <div className="flex justify-end items-center mt-5 gap-2">
                      <VisitReportModal
                        report_id={visit.report_id!}
                        disabled={loadingVisit}
                      />

                      <Popconfirm
                        title="حذف الزيارة"
                        description="هل أنت متأكد من أنك تريد حذف هذه الزيارة؟"
                        okText="نعم"
                        cancelText="إلغاء"
                        onConfirm={() => handleVisitDelete(visit.id)}
                      >
                        <Button danger size="middle" loading={loadingVisit}>
                          حذف الزيارة
                        </Button>
                      </Popconfirm>
                    </div>
                  </Card>
                ))}
              </div>
            </Col>

            <Divider />

            <Col xs={24} md={24}>
              <Title level={4} className="mb-5">
                الزيارات المجدولة ليوم {selectedDate.format("DD-MM-YYYY")}
              </Title>

              <div className="flex flex-wrap gap-4 justify-between">
                {scheduled.length == 0 && (
                  <Empty
                    description="لا توجد زيارات متبقية"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    className="w-full py-10"
                  />
                )}
                {scheduled.map((visit) => (
                  <Card
                    styles={{
                      header: {
                        padding: 0,
                      },
                    }}
                    key={visit.id}
                    className={`w-full sm:w-[49%] lg:w-[49%] h-52 flex flex-col justify-between shadow-sm border rounded-md border-calypso-500`}
                    title={
                      <div className="relative py-2 px-3 rounded-t-md mx-0 bg-calypso-50">
                        {/* Edit Icon (top-right corner) */}

                        {/* Row 1: Project + Location */}
                        <div className="flex items-center justify-between mb-1">
                          <Text
                            strong
                            className="truncate text-base line-clamp-1"
                          >
                            {visit.location.project_name} -{" "}
                            {visit.location.name}
                          </Text>

                          <div>
                            <VisitNotesModal
                              visit_id={visit.id}
                              value={visit.notes}
                              disabled={loadingVisit}
                            />
                            <Button
                              type="text"
                              size="small"
                              icon={<EditOutlined />}
                              className="text-gray-600 hover:text-blue-600"
                              onClick={() => navigate(`edit-visit/${visit.id}`)}
                            />
                          </div>
                        </div>

                        {/* Row 2: Date + Time + Status */}
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 text-xs text-gray-700">
                            <span dir="rtl">{visit.date}</span>
                            <span>{visit.time}</span>
                          </div>
                          <Tag color="blue" className="text-sm">
                            {visit.status}
                          </Tag>
                        </div>
                      </div>
                    }
                  >
                    <Text type="secondary" className="text-sm line-clamp-2">
                      {visit.purpose}
                    </Text>
                    <div className="flex justify-end items-center mt-5 gap-2">
                      <Popconfirm
                        title="حذف الزيارة"
                        description="هل أنت متأكد من أنك تريد حذف هذه الزيارة؟"
                        okText="نعم"
                        cancelText="إلغاء"
                        onConfirm={() => handleVisitDelete(visit.id)}
                      >
                        <Button danger size="middle" loading={loadingVisit}>
                          حذف الزيارة
                        </Button>
                      </Popconfirm>
                    </div>
                  </Card>
                ))}
              </div>
            </Col>

            <Divider />

            {/* Violations Section */}
            <Col xs={24} md={24}>
              <Title level={4} className="mb-3">
                المخالفات ليوم {selectedDate.format("DD-MM-YYYY")}
              </Title>

              <div className="flex flex-wrap gap-4 justify-between">
                {daily.violations.length == 0 && (
                  <Empty
                    description="لا توجد مخالفات"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    className="w-full py-10"
                  />
                )}

                {daily.violations.map((violation) => {
                  const isConfirmed = violation.confirmed_by_monitoring;

                  return (
                    <Card
                      styles={{
                        header: {
                          padding: 0,
                        },
                      }}
                      key={violation.id}
                      className="w-full sm:w-[49%] lg:w-[49%] shadow-sm border border-red-500 rounded-md"
                      title={
                        <div
                          className={`py-2 px-3 rounded-t-md mx-0 bg-red-100`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <Text
                              strong
                              className="truncate text-base line-clamp-1"
                            >
                              {violation.project_name} -{" "}
                              {violation.location_name}
                            </Text>

                            {isConfirmed && (
                              <Tag color="green" className="ml-2">
                                مؤكد
                              </Tag>
                            )}
                          </div>
                          <div className="flex items-center justify-between">
                            <Text className="text-xs">
                              {violation.created_at}
                            </Text>
                          </div>
                        </div>
                      }
                    >
                      <Text type="secondary" className="text-sm line-clamp-2">
                        {violation.violation_type}
                      </Text>
                      <div className="flex justify-end items-center mt-5 gap-2">
                        <ViolationReportModal
                          report_id={violation.id}
                          disabled={deletingViolation}
                        />

                        <Popconfirm
                          title="حذف المخالفة"
                          description="هل أنت متأكد من أنك تريد حذف هذه المخالفة؟"
                          okText="نعم"
                          cancelText="إلغاء"
                          onConfirm={() => handleViolationDelete(violation.id)}
                        >
                          <Button
                            danger
                            size="middle"
                            loading={deletingViolation}
                          >
                            حذف المخالفة
                          </Button>
                        </Popconfirm>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Col>
          </Row>
        )
      )}
    </div>
  );
};

export default VisitsController;
