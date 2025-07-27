import { Tabs } from "antd";
import AttendanceRecords from "../../components/attendance/AttendanceRecords";
import AttendanceSummary from "../../components/attendance/AttendanceSummary";

const AttendancePage: React.FC = () => {
  const tabItems = [
    {
      key: "1",
      label: "تسجيل الحضور",
      children: <AttendanceRecords />,
    },
    {
      key: "2",
      label: "ملخص الحضور",
      children: <AttendanceSummary />,
    },
  ];

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold">الحضور </h1>
      <Tabs defaultActiveKey="1" items={tabItems} direction="rtl" />
    </>
  );
};

export default AttendancePage;
