import { Button, Table, Card, Typography, DatePicker, Form } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import dayjs, { Dayjs } from "dayjs";
import { useState } from "react";
import { useNotification } from "@/providers/NotificationProvider";
import { useAppSelector } from "@/app/redux/hooks";
import { useLazyGetViolationsQuery } from "@/app/api/endpoints/visits";
import ErrorPage from "@/pages/ErrorPage";
import Loading from "@/components/Loading";

const { Title } = Typography;

const columns = [
  {
    title: "رقم المخالفة",
    dataIndex: "id",
    key: "id",
  },
  {
    title: "التاريخ",
    dataIndex: "created_at",
    key: "created_at",
  },
  {
    title: "المشروع",
    dataIndex: "project_name",
    key: "project",
  },
  {
    title: "الموقع",
    dataIndex: "location_name",
    key: "location",
  },
];

const dataSource = [
  {
    id: "V123",
    date: "2025-08-01",
    location: "بوابة شمالية",
    project_name: "أحمد محمد",
  },
  // Add more dummy or real data
];

const ViolationsList = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  const user = useAppSelector((state) => state.auth.user);
  const [form] = Form.useForm();

  const [fromDate, setFromDate] = useState<Dayjs>(dayjs());
  const [toDate, setToDate] = useState<Dayjs | null>(dayjs());

  const [getViolations, { data: violations, isFetching, isError, isSuccess }] =
    useLazyGetViolationsQuery();

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

    getViolations({
      employee: user?.employee_profile.id,
      from: fromDate?.format("YYYY-MM-DD"),
      to: toDate?.format("YYYY-MM-DD"),
    });
  };

  if (isError) return <ErrorPage />;
  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center">
        <Title level={3}>سجل المخالفات</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate("report-violation")}
        >
          تسجيل مخالفة
        </Button>
      </div>

      {/* Violations filters */}
      <div className="bg-white p-4 shadow-md rounded-md w-full mx-auto">
        <Title level={4} className="mb-4 text-right">
          عرض المخالفات
        </Title>
        <Form
          layout="vertical"
          form={form}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end"
          onFinish={handleSubmit}
        >
          <Form.Item
            label="من"
            className="mb-0"
            name={"from"}
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
            name={"to"}
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

      {isSuccess && (
        <Card>
          <Table
            dataSource={violations}
            columns={columns}
            rowKey={"id"}
            pagination={false}
            className="calypso-header"
            scroll={{ x: "max-content" }}
          />
        </Card>
      )}
    </div>
  );
};

export default ViolationsList;
