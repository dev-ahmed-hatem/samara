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
} from "antd";
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
    {
      isLoading: loadingVisit,
      isError: visitIsError,
      isSuccess: visitDone,
    },
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
      });
  }, [selectedSupervisor, month]);

  useEffect(() => {
    if (records && selectedDate && selectedSupervisor)
      getDaily({
        date: selectedDate.format("YYYY-MM-DD"),
        supervisor: selectedSupervisor,
      });
  }, [records, selectedDate, selectedSupervisor]);

  useEffect(() => {
    if (recordsError || dailyError)
      notification.error({ message: "حدث خطأ أثناء تحميل الزيارات" });
  }, [recordsError, dailyError]);

  useEffect(() => {
    if (visitDone || violationIsDone) {
      dispatch(api.util.invalidateTags([{ type: "DailyRecords", id: "LIST" }]));
      notification.success({ message: message });
    }
  }, [visitDone, violationIsDone]);

  useEffect(() => {
    if (visitIsError || violationIsError) {
      notification.error({ message: "حدث خطأ أثناء التنفيذ" });
    }
  }, [visitIsError, violationIsError]);

  if (fetchingSupervisors) return <Loading />;
  if (supervisorsError) return <ErrorPage />;
  return (
    <div className="p-4">
      <Title level={3} className="mb-4">
        إدارة الزيارات الميدانية
      </Title>

      <Col xs={24} md={8} className="mb-6">
        <Select
          placeholder="اختر المشرف"
          className="w-full"
          onChange={(value) => setSelectedSupervisor(value)}
        >
          {(supervisors as Employee[])?.map((sup) => (
            <Option key={sup.id} value={sup.id}>
              {sup.name}
            </Option>
          ))}
        </Select>
      </Col>

      {fetchingRecords ? (
        <Loading />
      ) : (
        records && (
          <Card className="shadow-sm mb-8">
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

            <Title level={4} className="mb-4">
              إضافة زيارة
            </Title>
            <CreateVisitForm
              selectedSupervisor={selectedSupervisor!}
              selectedDate={selectedDate.format("YYYY-MM-DD")}
            />
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
                الزيارات ليوم {selectedDate.format("DD-MM-YYYY")}
              </Title>

              <div className="flex flex-wrap gap-4 justify-between">
                {daily.visits.length == 0 && (
                  <Empty
                    description="لا توجد زيارات"
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    className="w-full py-10"
                  />
                )}
                {daily.visits.map((visit) => (
                  <Card
                    styles={{
                      header: {
                        padding: 0,
                      },
                    }}
                    key={visit.id}
                    className={`w-full sm:w-[49%] lg:w-[49%] h-52 flex flex-col justify-between shadow-sm border rounded-md ${
                      visit.status == "مكتملة"
                        ? "border-green-500"
                        : "border-calypso-500"
                    }`}
                    title={
                      <div
                        className={`py-2 px-3 rounded-t-md mx-0 ${
                          visit.status == "مكتملة"
                            ? "bg-green-100"
                            : "bg-calypso-50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <Text
                            strong
                            className="truncate text-base line-clamp-1"
                          >
                            {visit.location.project_name} -{" "}
                            {visit.location.name}
                          </Text>
                        </div>
                        <div className="flex items-center justify-between">
                          <Text className="text-xs">{visit.time}</Text>
                          <Tag
                            color={visit.status === "مكتملة" ? "green" : "blue"}
                            className="text-sm"
                          >
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
                      {visit.status === "مكتملة" && (
                        <Button
                          type="primary"
                          size="middle"
                          onClick={() =>
                            navigate(`view-report/${visit.report_id}`)
                          }
                          disabled={loadingVisit}
                        >
                          عرض التقرير
                        </Button>
                      )}

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

                {daily.violations.map((violation) => (
                  <Card
                    styles={{
                      header: {
                        padding: 0,
                      },
                    }}
                    key={violation.id}
                    className="w-full sm:w-[49%] lg:w-[49%] shadow-sm border border-red-500 rounded-md"
                    title={
                      <div className={`py-2 px-3 rounded-t-md mx-0 bg-red-100`}>
                        <div className="flex items-center justify-between mb-1">
                          <Text
                            strong
                            className="truncate text-base line-clamp-1"
                          >
                            {violation.project_name} - {violation.location_name}
                          </Text>
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
                      <Button
                        type="primary"
                        size="middle"
                        disabled={deletingViolation}
                        onClick={() =>
                          navigate(`view-violation/${violation.id}`)
                        }
                      >
                        عرض التفاصيل
                      </Button>

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
                ))}
              </div>
            </Col>
          </Row>
        )
      )}
    </div>
  );
};

export default VisitsController;
