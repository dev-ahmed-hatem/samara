import AttendanceSummary from "@/components/attendance/AttendanceSummary";
import { Typography } from "antd";

const { Title } = Typography;

const AttendanceReports = () => {
  return (
    <div className="p-4">
      <Title level={3} className="mb-5">
        تقارير التحضير اليومي
      </Title>
      <AttendanceSummary />
    </div>
  );
};

export default AttendanceReports;
