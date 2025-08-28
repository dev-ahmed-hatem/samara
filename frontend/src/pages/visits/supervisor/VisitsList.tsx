import React, { useEffect, useState } from "react";
import { Card, Empty, Button, DatePicker, Form, Typography, Radio } from "antd";
import { CheckCircleOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs, { Dayjs } from "dayjs";
import VisitCard from "@/components/visits/VisitCard";
import ErrorPage from "@/pages/ErrorPage";
import Loading from "@/components/Loading";
import { useLazyGetVisitsQuery } from "@/app/api/endpoints/visits";
import { useAppSelector } from "@/app/redux/hooks";
import { Visit } from "@/types/visit";
import { useNotification } from "@/providers/NotificationProvider";

const { Title } = Typography;

type FilteredVisitsType = {
  scheduled: Visit[];
  completed: Visit[];
};

const VisitsList: React.FC = () => {
  const notification = useNotification();
  const [form] = Form.useForm();
  const [filteredVisits, setFilteredVisits] = useState<FilteredVisitsType>({
    scheduled: [],
    completed: [],
  });

  const [fromDate, setFromDate] = useState<Dayjs>(dayjs());
  const [toDate, setToDate] = useState<Dayjs | null>(dayjs());
  const [period, setPeriod] = useState<"morning" | "evening">();

  const user = useAppSelector((state) => state.auth.user);
  const [getVisits, { data: visits, isFetching, isError, isSuccess }] =
    useLazyGetVisitsQuery();

  const handleSubmit = () => {
    if (!fromDate || !toDate) {
      notification.warning({ message: "يرجى اختيار تاريخ البداية والنهاية" });
      return;
    }

    if (toDate.isBefore(fromDate)) {
      notification.error({
        message: "تاريخ النهاية لا يمكن أن يكون قبل تاريخ البداية",
      });
      return;
    }

    getVisits({
      employee: user?.employee_profile.id,
      from: fromDate?.format("YYYY-MM-DD"),
      to: toDate?.format("YYYY-MM-DD"),
      period,
    });
  };

  useEffect(() => {
    if (isSuccess) {
      setFilteredVisits({
        scheduled: visits.filter((visit) => visit.status === "مجدولة"),
        completed: visits.filter((visit) => visit.status === "مكتملة"),
      });
    }
  }, [isSuccess, visits]);

  if (isError) return <ErrorPage />;
  return (
    <div className="space-y-6">
      <h1 className="mb-6 text-2xl font-bold">الزيارات</h1>

      {/* Visits filters */}
      <div className="bg-white p-4 shadow-md rounded-md w-full mx-auto">
        <Title level={4} className="mb-4 text-right">
          عرض الزيارات
        </Title>
        <Form
          layout="vertical"
          form={form}
          className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="من"
            className="mb-0"
            name="from"
            rules={[{ required: true, message: "يرجى اختيار تاريخ البداية" }]}
          >
            <DatePicker
              className="w-full"
              format="YYYY-MM-DD"
              value={fromDate}
              onChange={(date) => {
                setFromDate(date);
                if (toDate && date && toDate.isBefore(date)) {
                  setToDate(null);
                }
              }}
            />
          </Form.Item>

          <Form.Item
            name="to"
            label="إلى"
            className="mb-0"
            rules={[{ required: true, message: "يرجى اختيار تاريخ النهاية" }]}
          >
            <DatePicker
              className="w-full"
              format="YYYY-MM-DD"
              value={toDate}
              onChange={setToDate}
              disabledDate={(current) =>
                fromDate ? current && current.isBefore(fromDate, "day") : false
              }
            />
          </Form.Item>

          {/* Period field */}
          <Form.Item
            name="period"
            label="الفترة"
            className="mb-0"
            rules={[{ required: true, message: "يرجى اختيار الفترة" }]}
          >
            <Radio.Group
              className="flex"
              onChange={(event) => setPeriod(event.target.value)}
            >
              <Radio.Button value="morning">صباحية</Radio.Button>
              <Radio.Button value="evening">مسائية</Radio.Button>
            </Radio.Group>
          </Form.Item>

          {/* Submit button with better alignment */}
          <Form.Item className="mb-0 md:flex md:justify-end">
            <Button
              type="primary"
              htmlType="submit"
              className="w-full md:w-40"
              loading={isFetching}
            >
              عرض
            </Button>
          </Form.Item>
        </Form>
      </div>

      {isFetching && <Loading />}

      {/* Scheduled Visits */}
      {isSuccess && (
        <>
          <Card
            className="shadow-md"
            title={
              <div className="flex items-center gap-2 text-blue-600">
                <CalendarOutlined />
                زيارات مجدولة
              </div>
            }
          >
            <div className="grid gap-4">
              {filteredVisits!.scheduled?.length > 0 ? (
                filteredVisits?.scheduled.map((visit) => (
                  <VisitCard key={visit.id} visit={visit} type="scheduled" />
                ))
              ) : (
                <Empty description="لا توجد زيارات مجدولة" />
              )}
            </div>
          </Card>

          {/* Completed Visits */}
          <Card
            className="shadow-md border border-green-400"
            title={
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircleOutlined />
                زيارات مكتملة
              </div>
            }
          >
            <div className="grid gap-4">
              {filteredVisits!.completed?.length > 0 ? (
                filteredVisits?.completed.map((visit) => (
                  <VisitCard key={visit.id} visit={visit} type="completed" />
                ))
              ) : (
                <Empty description="لا توجد زيارات مكتملة" />
              )}
            </div>
          </Card>
        </>
      )}
    </div>
  );
};

export default VisitsList;
