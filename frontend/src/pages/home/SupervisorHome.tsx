import { Card, Col, Divider, Row, Statistic, Typography } from "antd";
import {
  ProjectOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router";
import Loading from "@/components/Loading";
import ErrorPage from "../ErrorPage";
import { useGetHomeStatsQuery } from "@/app/api/endpoints/employees";
import { useAppSelector } from "@/app/redux/hooks";

const SupervisorHome: React.FC = () => {
  const navigate = useNavigate();
  const today = dayjs().format("DD-MM-YYYY");
  const user = useAppSelector((state) => state.auth.user);

  const { data: stats, isFetching, isError } = useGetHomeStatsQuery();

  if (isFetching || !user) return <Loading />;
  if (isError) return <ErrorPage />;

  return (
    <div className="p-4 space-y-8">
      {/* Welcome Message */}
      <div className="flex flex-col items-center justify-center px-6 py-6 bg-gradient-to-r from-[#b79237] via-yellow-600 to-[#b79237] rounded-2xl shadow-xl text-white text-center">
        {/* Logo */}
        <img
          src="./samara.jpg"
          alt="Logo"
          className="size-24 object-contain rounded-full border-4 border-white shadow-lg bg-white mb-4"
        />

        {/* Text */}
        <h1 className="text-2xl sm:text-3xl font-bold flex items-center justify-center gap-2">
          مرحبًا بك،
          <span className="text-white">{user?.employee_profile.name}</span>
          <SmileOutlined className="text-yellow-300" />
        </h1>
      </div>

      {/* Today's Overview Header */}
      <Typography.Title
        level={5}
        className="text-right text-gray-700 border-r-4 border-[#b79237] pr-3"
      >
        إحصائيات اليوم ( {today} )
      </Typography.Title>

      {/* Overview Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card className="rounded-2xl border border-blue-300 shadow-md hover:shadow-lg transition-shadow duration-300">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">عدد المشاريع</span>
              }
              value={stats!.project_count}
              prefix={<ProjectOutlined className="text-blue-500 text-2xl" />}
              valueStyle={{ fontSize: "1.5rem", fontWeight: "bold" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="rounded-2xl border border-green-300 shadow-md hover:shadow-lg transition-shadow duration-300">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">عدد المواقع</span>
              }
              value={stats!.location_count}
              prefix={
                <EnvironmentOutlined className="text-green-500 text-2xl" />
              }
              valueStyle={{ fontSize: "1.5rem", fontWeight: "bold" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="rounded-2xl border border-yellow-300 shadow-md hover:shadow-lg transition-shadow duration-300">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  الزيارات المجدولة اليوم
                </span>
              }
              value={stats!.scheduled_visits}
              prefix={<CalendarOutlined className="text-yellow-500 text-2xl" />}
              valueStyle={{ fontSize: "1.5rem", fontWeight: "bold" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="rounded-2xl border border-green-400 shadow-md hover:shadow-lg transition-shadow duration-300">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  الزيارات المكتملة
                </span>
              }
              value={stats!.completed_visits}
              prefix={
                <CheckCircleOutlined className="text-green-500 text-2xl" />
              }
              valueStyle={{ fontSize: "1.5rem", fontWeight: "bold" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="rounded-2xl border border-red-300 shadow-md hover:shadow-lg transition-shadow duration-300">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">عدد المخالفات</span>
              }
              value={stats!.violations}
              prefix={<WarningOutlined className="text-red-500 text-2xl" />}
              valueStyle={{ fontSize: "1.5rem", fontWeight: "bold" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="rounded-2xl border border-indigo-300 shadow-md hover:shadow-lg transition-shadow duration-300">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  تسجيلات الحضور
                </span>
              }
              value={stats!.attendance_records}
              prefix={
                <ClockCircleOutlined className="text-indigo-500 text-2xl" />
              }
              valueStyle={{ fontSize: "1.5rem", fontWeight: "bold" }}
            />
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Navigation Cards */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card
            className="h-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 text-white shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-300 cursor-pointer"
            onClick={() => navigate("visits")}
          >
            <div className="flex items-center gap-3">
              <CalendarOutlined className="text-3xl md:text-4xl" />
              <div className="text-lg md:text-xl font-bold">
                جدول الزيارات الميدانية
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12}>
          <Card
            className="h-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 text-white shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-300 cursor-pointer"
            onClick={() => navigate("attendance")}
          >
            <div className="flex items-center gap-3">
              <ClockCircleOutlined className="text-3xl md:text-4xl" />
              <div className="text-lg md:text-xl font-bold">
                التحضير اليومي لرجال الأمن
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Card
            className="h-full flex items-center justify-between p-4 rounded-2xl bg-gradient-to-br from-red-400 to-red-600 text-white shadow-md hover:shadow-xl hover:scale-[1.03] transition-all duration-300 cursor-pointer"
            onClick={() => navigate("violations")}
          >
            <div className="flex items-center gap-3">
              <WarningOutlined className="text-3xl md:text-4xl" />
              <div className="text-lg md:text-xl font-bold">سجل المخالفات</div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default SupervisorHome;
