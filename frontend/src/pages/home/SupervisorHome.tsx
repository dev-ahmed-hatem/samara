import { Card, Col, Divider, Row, Statistic, Typography } from "antd";
import {
  ProjectOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
  SmileOutlined,
  IdcardOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router";
import Loading from "@/components/Loading";
import ErrorPage from "../ErrorPage";
import { useGetSupervisorHomeStatsQuery } from "@/app/api/endpoints/employees";
import { useAppSelector } from "@/app/redux/hooks";

const SupervisorHome: React.FC = () => {
  const navigate = useNavigate();
  const today = dayjs();
  const user = useAppSelector((state) => state.auth.user);

  const { data: stats, isFetching, isError } = useGetSupervisorHomeStatsQuery();

  if (isFetching || !user) return <Loading />;
  if (isError) return <ErrorPage />;

  return (
    <div className="p-4 space-y-12">
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

      {/* === General Overview Section === */}
      <Typography.Title
        level={5}
        className="text-right text-gray-700 border-r-4 border-[#b79237] pr-3 mt-6"
      >
        نظرة عامة
      </Typography.Title>
      <Row gutter={[16, 16]}>
        {/* Projects */}
        <Col xs={24} sm={12} md={8}>
          <Card
            className="h-full flex rounded-2xl border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300 
                 bg-gradient-to-br from-cyan-500 to-blue-700 text-white"
          >
            <Statistic
              title={
                <span className="text-white font-medium">عدد المشاريع</span>
              }
              value={stats!.general.projects_count}
              prefix={<ProjectOutlined className="text-white text-2xl" />}
              valueStyle={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "white",
              }}
            />
          </Card>
        </Col>

        {/* Locations */}
        <Col xs={24} sm={12} md={8}>
          <Card
            className="h-full flex rounded-2xl border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300 
                 bg-gradient-to-br from-emerald-500 to-green-700 text-white"
          >
            <Statistic
              title={
                <span className="text-white font-medium">عدد المواقع</span>
              }
              value={stats!.general.locations_count}
              prefix={<EnvironmentOutlined className="text-white text-2xl" />}
              valueStyle={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "white",
              }}
            />
          </Card>
        </Col>

        {/* Guards */}
        <Col xs={24} sm={12} md={8}>
          <Card
            className="h-full flex rounded-2xl border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300 
                 bg-gradient-to-br from-pink-500 to-rose-700 text-white"
          >
            <Statistic
              title={
                <span className="text-white font-medium">عدد رجال الأمن</span>
              }
              value={stats!.general.guards_count}
              prefix={<IdcardOutlined className="text-white text-2xl" />}
              valueStyle={{
                fontSize: "1.5rem",
                fontWeight: "bold",
                color: "white",
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* === Today's Overview Section === */}
      <Typography.Title
        level={5}
        className="text-right text-gray-700 border-r-4 border-[#b79237] pr-3 mt-8"
      >
        إحصائيات اليوم ( {today.format("DD-MM-YYYY")} )
      </Typography.Title>

      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={12} md={6}>
          <Card
            className="h-full flex flex-col rounded-2xl border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300 
               bg-gradient-to-br from-yellow-400 to-orange-600 text-white"
          >
            <div className="flex items-center gap-2 mb-2">
              <CalendarOutlined className="text-white text-2xl" />
              <span className="text-lg font-semibold">الزيارات المجدولة</span>
            </div>

            <div className="flex justify-between mt-2">
              <div className="text-center flex-1">
                <div className="text-sm text-white/90">صباحية</div>
                <div className="text-xl font-bold">
                  {stats!.today.scheduled.morning}
                </div>
              </div>
              <div className="w-px bg-white/30 mx-2"></div>
              <div className="text-center flex-1">
                <div className="text-sm text-white/90">مسائية</div>
                <div className="text-xl font-bold">
                  {stats!.today.scheduled.evening}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            className="h-full flex flex-col rounded-2xl border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300 
               bg-gradient-to-br from-green-400 to-emerald-600 text-white"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircleOutlined className="text-white text-2xl" />
              <span className="text-lg font-semibold">الزيارات المكتملة</span>
            </div>

            <div className="flex justify-between mt-2">
              <div className="text-center flex-1">
                <div className="text-sm text-white/90">صباحية</div>
                <div className="text-xl font-bold">
                  {stats!.today.completed.morning}
                </div>
              </div>
              <div className="w-px bg-white/30 mx-2"></div>
              <div className="text-center flex-1">
                <div className="text-sm text-white/90">مسائية</div>
                <div className="text-xl font-bold">
                  {stats!.today.completed.evening}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="h-full flex rounded-2xl border border-indigo-300 shadow-md hover:shadow-lg transition-shadow duration-300">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  تسجيلات الحضور
                </span>
              }
              value={stats!.today.attendance_records}
              prefix={
                <ClockCircleOutlined className="text-indigo-500 text-2xl" />
              }
              valueStyle={{ fontSize: "1.5rem", fontWeight: "bold" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="h-full flex rounded-2xl border border-red-300 shadow-md hover:shadow-lg transition-shadow duration-300">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">عدد المخالفات</span>
              }
              value={stats!.today.violations}
              prefix={<WarningOutlined className="text-red-500 text-2xl" />}
              valueStyle={{ fontSize: "1.5rem", fontWeight: "bold" }}
            />
          </Card>
        </Col>
      </Row>

      {/* === Yesterday's Overview Section === */}
      <Typography.Title
        level={5}
        className="text-right text-gray-700 border-r-4 border-[#b79237] pr-3 mt-8"
      >
        إحصائيات الأمس ( {today.subtract(1, "day").format("DD-MM-YYYY")} )
      </Typography.Title>
      <Row gutter={[16, 16]} className="mb-4">
        <Col xs={24} sm={12} md={6}>
          <Card
            className="h-full flex flex-col rounded-2xl border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300 
               bg-gradient-to-br from-yellow-400 to-orange-600 text-white"
          >
            <div className="flex items-center gap-2 mb-2">
              <CalendarOutlined className="text-white text-2xl" />
              <span className="text-lg font-semibold">الزيارات المجدولة</span>
            </div>

            <div className="flex justify-between mt-2">
              <div className="text-center flex-1">
                <div className="text-sm text-white/90">صباحية</div>
                <div className="text-xl font-bold">
                  {stats!.yesterday.scheduled.morning}
                </div>
              </div>
              <div className="w-px bg-white/30 mx-2"></div>
              <div className="text-center flex-1">
                <div className="text-sm text-white/90">مسائية</div>
                <div className="text-xl font-bold">
                  {stats!.yesterday.scheduled.evening}
                </div>
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            className="h-full flex flex-col rounded-2xl border-0 shadow-xl hover:shadow-2xl transition-shadow duration-300 
               bg-gradient-to-br from-green-400 to-emerald-600 text-white"
          >
            <div className="flex items-center gap-2 mb-2">
              <CheckCircleOutlined className="text-white text-2xl" />
              <span className="text-lg font-semibold">الزيارات المكتملة</span>
            </div>

            <div className="flex justify-between mt-2">
              <div className="text-center flex-1">
                <div className="text-sm text-white/90">صباحية</div>
                <div className="text-xl font-bold">
                  {stats!.yesterday.completed.morning}
                </div>
              </div>
              <div className="w-px bg-white/30 mx-2"></div>
              <div className="text-center flex-1">
                <div className="text-sm text-white/90">مسائية</div>
                <div className="text-xl font-bold">
                  {stats!.yesterday.completed.evening}
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="h-full flex rounded-2xl border border-indigo-300 shadow-md hover:shadow-lg transition-shadow duration-300">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">
                  تسجيلات الحضور
                </span>
              }
              value={stats!.yesterday.attendance_records}
              prefix={
                <ClockCircleOutlined className="text-indigo-500 text-2xl" />
              }
              valueStyle={{ fontSize: "1.5rem", fontWeight: "bold" }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card className="h-full flex rounded-2xl border border-red-300 shadow-md hover:shadow-lg transition-shadow duration-300">
            <Statistic
              title={
                <span className="text-gray-600 font-medium">عدد المخالفات</span>
              }
              value={stats!.yesterday.violations}
              prefix={<WarningOutlined className="text-red-500 text-2xl" />}
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
