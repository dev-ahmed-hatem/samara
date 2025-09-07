import { Card, Statistic, Table, Tooltip, Typography } from "antd";
import { PieChart, Pie, Cell, Legend } from "recharts";
import { CheckCircleOutlined, TeamOutlined } from "@ant-design/icons";

const { Title } = Typography;

type ShiftStatsProps = {
  shiftAttendance: any;
};

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

const ShiftStats = ({ shiftAttendance }: ShiftStatsProps) => {
  return (
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
              labelLine={false}
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
          <span className="mx-1 font-bold">{shiftAttendance.created_at}</span>
        </span>
      </div>

      {/* Suprvisor */}
      <div
        className="bg-blue-50 border border-blue-200 rounded-md p-4 
          flex items-center gap-3 text-blue-800 shadow-sm mt-2"
      >
        <CheckCircleOutlined className="text-xl" />
        <span className="text-sm sm:text-base font-medium">
          تم تسجيل الحضور بواسطة
          <span className="mx-1 font-bold">{shiftAttendance.created_by}</span>
        </span>
      </div>
    </Card>
  );
};

export default ShiftStats;
