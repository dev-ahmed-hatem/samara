import React, { useState } from "react";
import {
  Card,
  Form,
  Select,
  Radio,
  Button,
  DatePicker,
  Table,
  Typography,
} from "antd";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const { Title } = Typography;

// Dummy Data
const dummyProjects = [
  { id: 1, name: "مشروع الرياض" },
  { id: 2, name: "مشروع جدة" },
];

const dummyLocations: Record<string, Array<string>> = {
  1: ["موقع 1", "موقع 2"],
  2: ["موقع 3"],
};

const chartData = [
  { name: "الحضور", value: 25 },
  { name: "التأخير", value: 5 },
  { name: "الغياب", value: 8 },
];

const COLORS = ["#4ade80", "#facc15", "#f87171"];

const tableData = [
  {
    key: "1",
    name: "أحمد علي",
    status: "حاضر",
    note: "",
  },
  {
    key: "2",
    name: "سعيد مرزوق",
    status: "متأخر",
    note: "تأخر 15 دقيقة",
  },
  {
    key: "3",
    name: "خالد فهد",
    status: "غائب",
    note: "بدون إذن",
  },
];

const AttendanceSummary: React.FC = () => {
  const [form] = Form.useForm();
  const [showReport, setShowReport] = useState(false);
  const [projectId, setProjectId] = useState<number | null>(null);

  const columns = [
    {
      title: "الموظف",
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
      dataIndex: "note",
      key: "note",
      render: (text: string) => text || "-",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Filter Section */}
      <Card title="تصفية التقرير" className="shadow-md">
        <Form
          layout="vertical"
          form={form}
          className="grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Form.Item label="اليوم" name="date" className="col-span-1">
            <DatePicker className="w-full" format="DD-MM-YYYY" />
          </Form.Item>

          <Form.Item label="المشروع" name="project" className="col-span-1">
            <Select
              placeholder="اختر المشروع"
              onChange={(value) => {
                setProjectId(value);
                form.setFieldValue("location", undefined);
              }}
            >
              {dummyProjects.map((p) => (
                <Select.Option key={p.id} value={p.id}>
                  {p.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item label="الموقع" name="location" className="col-span-1">
            <Select placeholder="اختر الموقع" disabled={!projectId}>
              {projectId &&
                dummyLocations[projectId]?.map((loc) => (
                  <Select.Option key={loc} value={loc}>
                    {loc}
                  </Select.Option>
                ))}
            </Select>
          </Form.Item>

          <Form.Item label="الوردية" name="shift" className="col-span-1">
            <Radio.Group className="flex gap-2">
              <Radio.Button value="الأولى">الأولى</Radio.Button>
              <Radio.Button value="الثانية">الثانية</Radio.Button>
              <Radio.Button value="الثالثة">الثالثة</Radio.Button>
            </Radio.Group>
          </Form.Item>
        </Form>

        <div className="text-end mt-4">
          <Button type="primary" onClick={() => setShowReport(true)}>
            عرض
          </Button>
        </div>
      </Card>

      {/* Report Section */}
      {showReport && (
        <Card title="ملخص الحضور" className="shadow-md">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div>
              <Title level={5}>نسبة الحضور</Title>
              <PieChart width={300} height={300}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index]} />
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
                dataSource={tableData}
                pagination={false}
                className="calypso-header"
                scroll={{ x: "max-content" }}
              />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AttendanceSummary;
