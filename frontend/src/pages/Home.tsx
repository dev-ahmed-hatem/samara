import { Card, Col, Divider, Row, Statistic, Typography } from "antd";
import {
  ProjectOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router";
import Loading from "@/components/Loading";
import ErrorPage from "./ErrorPage";
import { useGetHomeStatsQuery } from "@/app/api/endpoints/employees";
import { useAppSelector } from "@/app/redux/hooks";

export type HomeStats = {
  project_count: number;
  location_count: number;
  scheduled_visits: number;
  completed_visits: number;
  violations: number;
  attendance_records: number;
};

const Home: React.FC = () => {
  const navigate = useNavigate();
  const today = dayjs().format("DD-MM-YYYY");
  const user = useAppSelector((state) => state.auth.user);

  const { data: stats, isFetching, isError } = useGetHomeStatsQuery();

  if (isFetching || !user) return <Loading />;
  if (isError) return <ErrorPage />;

  return (
    <div className="p-4 space-y-6">
      {/* Welcome Message */}
      <Typography.Title level={4} className="text-right">
        أهلاً،{" "}
        <span className="text-blue-600 font-semibold">
          {user?.employee_profile.name}
        </span>
      </Typography.Title>

      {/* Today's Overview Header */}
      <Typography.Title level={5} className="text-right text-gray-600">
        إحصائيات اليوم ( {today} )
      </Typography.Title>

      {/* Overview Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-sm rounded-2xl">
            <Statistic
              title="عدد المشاريع"
              value={stats!.project_count}
              prefix={<ProjectOutlined className="text-blue-500 text-xl" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-sm rounded-2xl">
            <Statistic
              title="عدد المواقع"
              value={stats!.location_count}
              prefix={
                <EnvironmentOutlined className="text-green-500 text-xl" />
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-sm rounded-2xl">
            <Statistic
              title="الزيارات المجدولة اليوم"
              value={stats!.scheduled_visits}
              prefix={<CalendarOutlined className="text-yellow-500 text-xl" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-sm rounded-2xl">
            <Statistic
              title="الزيارات المكتملة"
              value={stats!.completed_visits}
              prefix={
                <CheckCircleOutlined className="text-green-500 text-xl" />
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-sm rounded-2xl">
            <Statistic
              title="عدد المخالفات"
              value={stats!.violations}
              prefix={<WarningOutlined className="text-red-500 text-xl" />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card className="shadow-sm rounded-2xl">
            <Statistic
              title="تسجيلات الحضور"
              value={stats!.attendance_records}
              prefix={
                <ClockCircleOutlined className="text-indigo-500 text-xl" />
              }
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Navigation Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card
            className="flex items-center justify-between p-4 hover:bg-blue-50 transition-all duration-200 cursor-pointer shadow-md rounded-2xl"
            onClick={() => navigate("visits")}
          >
            <div className="flex items-center gap-4">
              <CalendarOutlined className="text-3xl text-blue-600" />
              <div className="text-lg font-semibold text-blue-600">
                جدول الزيارات الميدانية
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12}>
          <Card
            className="flex items-center justify-between p-4 hover:bg-yellow-50 transition-all duration-200 cursor-pointer shadow-md rounded-2xl"
            onClick={() => navigate("attendance")}
          >
            <div className="flex items-center gap-4">
              <ClockCircleOutlined className="text-3xl text-yellow-500" />
              <div className="text-lg font-semibold text-yellow-600">
                التحضير اليومي لرجال الأمن
              </div>
            </div>
          </Card>
        </Col>
      </Row>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card
            className="flex items-center justify-between p-4 hover:bg-red-50 transition-all duration-200 cursor-pointer shadow-md rounded-2xl"
            onClick={() => navigate("violations")}
          >
            <div className="flex items-center gap-4">
              <WarningOutlined className="text-3xl text-red-500" />
              <div className="text-lg font-semibold text-red-600">
                سجل المخالفات
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Home;
