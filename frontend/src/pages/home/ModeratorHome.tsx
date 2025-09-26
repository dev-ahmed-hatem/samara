import { Card, Col, Divider, List, Row, Statistic, Typography } from "antd";
import {
  ProjectOutlined,
  EnvironmentOutlined,
  CalendarOutlined,
  UserSwitchOutlined,
  TeamOutlined,
  UserOutlined,
  IdcardOutlined,
  ScheduleOutlined,
  SmileOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { useNavigate } from "react-router";
import Loading from "@/components/Loading";
import ErrorPage from "../ErrorPage";
import { useGetModeratorHomeStatsQuery } from "@/app/api/endpoints/employees";
import { useAppSelector } from "@/app/redux/hooks";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from "recharts";
import { SupervisorSummary } from "@/types/homeStat";

const { Title, Text } = Typography;

const ModeratorHome: React.FC = () => {
  const navigate = useNavigate();
  const today = dayjs().format("DD-MM-YYYY");
  const user = useAppSelector((state) => state.auth.user);

  const { data: stats, isFetching, isError } = useGetModeratorHomeStatsQuery();

  if (isFetching || !user) return <Loading />;
  if (isError) return <ErrorPage />;

  return (
    <div className="space-y-10">
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

      <Divider />

      {/* Navigation Cards */}
      <Row gutter={[16, 16]}>
        {/* رجال الأمن */}
        <Col xs={24} sm={12}>
          <Card
            className="h-full flex items-center justify-between p-6 bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer rounded-2xl"
            onClick={() => navigate("security-guards")}
          >
            <div className="flex items-center gap-4 w-full">
              <IdcardOutlined className="text-4xl text-white drop-shadow-lg" />
              <div className="text-xl font-bold leading-tight">رجال الأمن</div>
            </div>
          </Card>
        </Col>

        {/* المشروعات والمواقع */}
        <Col xs={24} sm={12}>
          <Card
            className="h-full flex items-center justify-between p-6 bg-gradient-to-r from-yellow-400 to-orange-500 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer rounded-2xl"
            // onClick={() => navigate("projects")}
          >
            <div className="flex items-center gap-4 w-full">
              <EnvironmentOutlined className="text-4xl text-white drop-shadow-lg" />
              <div className="text-xl font-bold leading-tight">
                المشروعات والمواقع
              </div>
            </div>
          </Card>
        </Col>

        {/* سجل الزيارات والمخالفات */}
        <Col xs={24} sm={12}>
          <Card
            className="h-full flex items-center justify-between p-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer rounded-2xl"
            onClick={() => navigate("visits")}
          >
            <div className="flex items-center gap-4 w-full">
              <CalendarOutlined className="text-4xl text-white drop-shadow-lg" />
              <div className="text-xl font-bold leading-tight">
                سجل الزيارات والمخالفات
              </div>
            </div>
          </Card>
        </Col>

        {/* تسجيلات حضور رجال الأمن */}
        <Col xs={24} sm={12}>
          <Card
            className="h-full flex items-center justify-between p-6 bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer rounded-2xl"
            onClick={() => navigate("attendance")}
          >
            <div className="flex items-center gap-4 w-full">
              <ScheduleOutlined className="text-4xl text-white drop-shadow-lg" />
              <div className="text-xl font-bold leading-tight">
                تسجيلات حضور رجال الأمن
              </div>
            </div>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Today's Overview Header */}
      <Typography.Title level={5} className="text-right text-gray-600">
        إحصائيات اليوم ( {today} )
      </Typography.Title>

      {/* Overview Cards */}
      <div>
        {/* Section Title */}
        <Title level={4} className="mb-4 text-gray-700">
          المعلومات العامة
        </Title>

        {/* Navigation Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm rounded-2xl border-t-4 border-blue-500">
              <Statistic
                title="عدد المشاريع"
                value={stats!.general.projects_count}
                prefix={<ProjectOutlined className="text-blue-500 text-xl" />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm rounded-2xl border-t-4 border-green-500">
              <Statistic
                title="عدد المواقع"
                value={stats!.general.locations_count}
                prefix={
                  <EnvironmentOutlined className="text-green-500 text-xl" />
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm rounded-2xl border-t-4 border-purple-500">
              <Statistic
                title="عدد رجال الأمن"
                value={stats!.general.security_guards_count}
                prefix={
                  <UserSwitchOutlined className="text-purple-500 text-xl" />
                }
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={6}>
            <Card className="shadow-sm rounded-2xl border-t-4 border-orange-500">
              <Statistic
                title="عدد المشرفين"
                value={stats?.general.supervisors_count}
                prefix={<TeamOutlined className="text-orange-500 text-xl" />}
              />
            </Card>
          </Col>
        </Row>
      </div>

      <Divider />

      <div className="mt-8">
        {/* Section Title */}
        <Title level={4} className="mb-4 text-gray-700">
          معلومات الزيارات الميدانية
        </Title>

        <Row gutter={[16, 16]}>
          {/* Today Visits Overview */}
          <Col xs={24} md={24}>
            <Card
              title={
                <div className="flex items-center gap-2 text-blue-600">
                  <CalendarOutlined /> <span>إجمالي عدد زيارات اليوم</span>
                </div>
              }
              className="rounded-2xl shadow-md border-t-4 border-blue-500"
            >
              <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                  <Card
                    size="small"
                    className="rounded-xl shadow-sm border-l-4 border-green-500"
                    title={
                      <div className="flex justify-between">
                        <span>الصباحية</span>
                        <span className="text-blue-600">
                          {stats?.today_visits.morning.total}
                        </span>
                      </div>
                    }
                  >
                    <Statistic
                      title="الزيارات المكتملة"
                      value={stats?.today_visits.morning.completed}
                    />
                    <Statistic
                      title="الزيارات المتبقية"
                      value={stats?.today_visits.morning.scheduled}
                    />
                  </Card>
                </Col>
                <Col xs={24} md={12}>
                  <Card
                    size="small"
                    className="rounded-xl shadow-sm border-l-4 border-purple-500"
                    title={
                      <div className="flex justify-between">
                        <span>المسائية</span>
                        <span className="text-blue-600">
                          {stats?.today_visits.evening.total}
                        </span>
                      </div>
                    }
                  >
                    <Statistic
                      title="الزيارات المكتملة"
                      value={stats?.today_visits.evening.completed}
                    />
                    <Statistic
                      title="الزيارات المتبقية"
                      value={stats?.today_visits.evening.scheduled}
                    />
                  </Card>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Supervisors List */}
          <Col xs={24} md={24}>
            <Card
              title={
                <div className="flex items-center gap-2 text-orange-600">
                  <UserOutlined /> <span>إحصائيات المشرفين</span>
                </div>
              }
              className="rounded-2xl shadow-md border-t-4 border-orange-500"
            >
              <List
                itemLayout="vertical"
                dataSource={stats?.supervisors}
                renderItem={(sup: SupervisorSummary) => (
                  <Card
                    size="small"
                    className="mb-3 rounded-xl shadow-sm bg-gradient-to-r from-orange-50 to-orange-100"
                    title={<Text strong>{sup.name}</Text>}
                  >
                    <Row gutter={[12, 12]}>
                      <Col xs={24} md={12}>
                        <Card
                          size="small"
                          className="rounded-lg border-l-4 border-green-500"
                        >
                          <div className="flex justify-between items-center">
                            <Text className="font-semibold text-green-600">
                              الصباحية
                            </Text>
                            <Text className="text-gray-600">
                              اجمالي الزيارات: {sup.morning.total}
                            </Text>
                          </div>
                          <div>الزيارات المكتملة: {sup.morning.completed}</div>
                          <div>الزيارات المتبقية: {sup.morning.scheduled}</div>
                        </Card>
                      </Col>
                      <Col xs={24} md={12}>
                        <Card
                          size="small"
                          className="rounded-lg border-l-4 border-purple-500"
                        >
                          <div className="flex justify-between items-center">
                            <Text className="font-semibold text-purple-600">
                              المسائية
                            </Text>
                            <Text className="text-gray-600">
                              اجمالي الزيارات: {sup.evening.total}
                            </Text>
                          </div>
                          <div>الزيارات المكتملة: {sup.evening.completed}</div>
                          <div>الزيارات المتبقية: {sup.evening.scheduled}</div>
                        </Card>
                      </Col>
                    </Row>
                  </Card>
                )}
              />
            </Card>
          </Col>
        </Row>
      </div>

      <Divider />

      <div className="mt-8">
        {/* Section Title */}
        <Title level={4} className="mb-4 text-gray-700">
          التحضير اليومي
        </Title>
        <Card className="shadow-md rounded-2xl p-4">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">
            عدد الورديات المسجل حضورها اليوم:{" "}
            <span className="text-2xl text-blue-600">
              {stats?.shifts_count}
            </span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Attendance Status Pie Chart */}
            <div className="flex flex-col items-center">
              <h3 className="text-md font-medium mb-2 text-gray-600">
                حالات الحضور
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats?.attendance}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label
                    outerRadius={90}
                    dataKey="value"
                  >
                    {stats?.attendance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Shift Distribution Pie Chart */}
            <div className="flex flex-col items-center">
              <h3 className="text-md font-medium mb-2 text-gray-600">
                التسجيل في كل وردية
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats?.shifts}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label
                    outerRadius={90}
                    dataKey="value"
                  >
                    {stats?.shifts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ModeratorHome;
