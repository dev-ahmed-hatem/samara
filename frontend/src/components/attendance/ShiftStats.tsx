import {
  Button,
  Card,
  Select,
  Statistic,
  Table,
  Tooltip,
  Typography,
} from "antd";
import { PieChart, Pie, Cell, Legend } from "recharts";
import { CheckCircleOutlined, TeamOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useSecurityGuardAttendanceMutation } from "@/app/api/endpoints/attendance";
import { useNotification } from "@/providers/NotificationProvider";

const { Title } = Typography;

type ShiftStatsProps = {
  shiftAttendance: any;
};

const statuses = ["حاضر", "متأخر", "غائب", "راحة"];

const ShiftStats = ({ shiftAttendance }: ShiftStatsProps) => {
  const [editingRow, setEditingRow] = useState<string | null>(null);
  const [editedStatus, setEditedStatus] = useState<string>("");

  const notification = useNotification();

  const [handleRecord, { isLoading }] = useSecurityGuardAttendanceMutation();

  const handleEditClick = (record: any) => {
    setEditingRow(record.id);
    setEditedStatus(record.status);
  };

  const handleSave = async () => {
    if (!editingRow || !editedStatus) return;
    try {
      await handleRecord({ id: editingRow, status: editedStatus });
      notification.success({ message: "تم تعديل الحالة" });
    } catch {
      notification.success({ message: "خطأ في تعديل الحالة" });
    }
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
      render: (text: string, record: any) => {
        if (editingRow === record.id) {
          return (
            <div className="flex items-center gap-2">
              <Select
                value={editedStatus}
                onChange={(value) => setEditedStatus(value)}
                options={statuses.map((s) => ({ label: s, value: s }))}
                className="w-28"
              />
              <Button
                type="primary"
                size="small"
                onClick={() => handleSave()}
                loading={isLoading}
              >
                حفظ
              </Button>
              <Button size="small" onClick={() => setEditingRow(null)}>
                إلغاء
              </Button>
            </div>
          );
        }
        return (
          <span
            className="cursor-pointer text-blue-600 hover:underline"
            onClick={() => handleEditClick(record)}
          >
            {text || "-"}
          </span>
        );
      },
    },
    {
      title: "ملاحظات",
      dataIndex: "notes",
      key: "notes",
      render: (text: string) => text || "-",
    },
  ];

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
