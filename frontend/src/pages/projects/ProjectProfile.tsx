import { useEffect } from "react";
import {
  Card,
  Avatar,
  Button,
  Popconfirm,
  Tabs,
  Statistic,
  message,
} from "antd";
import {
  EditOutlined,
  DeleteOutlined,
  EnvironmentOutlined,
  LoadingOutlined,
} from "@ant-design/icons";
import { useParams, useNavigate } from "react-router";
import Loading from "@/components/Loading";
import ErrorPage from "@/pages/ErrorPage";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import { useNotification } from "@/providers/NotificationProvider";
import {
  useGetProjectQuery,
  useProjectMutation,
} from "@/app/api/endpoints/projects";
import { useAppSelector } from "@/app/redux/hooks";
import ProjectLocationsList from "@/components/projects/ProjectLocations";
import ProjectGuardsList from "@/components/projects/ProjectGuardsList";

const ProjectProfile: React.FC = () => {
  const [messageApi, contextHolder] = message.useMessage();
  const navigate = useNavigate();
  const notification = useNotification();
  const { project_id } = useParams();
  const user = useAppSelector((state) => state.auth.user);

  const {
    data: project,
    isLoading,
    isFetching,
    isError,
    error: projectError,
  } = useGetProjectQuery({ id: project_id as string, format: "detailed" });

  const [
    deleteProject,
    {
      isError: deleteIsError,
      error: deleteError,
      isLoading: deleting,
      isSuccess: deleted,
    },
  ] = useProjectMutation();

  const handleDelete = () => {
    deleteProject({
      url: `/projects/projects/${project_id}/`,
      method: "DELETE",
      data: {},
    });
  };

  useEffect(() => {
    if (deleteIsError) {
      let message = (deleteError as axiosBaseQueryError)?.data.detail ?? null;
      notification.error({
        message: message ?? "حدث خطأ أثناء حذف المشروع ! برجاء إعادة المحاولة",
      });
    }
  }, [deleteIsError]);

  useEffect(() => {
    if (deleted) {
      notification.success({
        message: "تم حذف المشروع بنجاح",
      });
      navigate(`/${user!.role}/projects`);
    }
  }, [deleted]);

  useEffect(() => {
    if (isFetching) {
      messageApi.open({
        key: "fetching",
        type: "loading",
        icon: <LoadingOutlined spin className="text-[#b79237]" />,
        content: (
          <span className="flex items-center gap-2">جاري تحديث البيانات..</span>
        ),
        duration: 0,
      });
    } else {
      messageApi.destroy("fetching"); // close when done
    }
  }, [isFetching]);

  if (isLoading) return <Loading />;
  if (isError) {
    const error_title =
      (projectError as axiosBaseQueryError).status === 404
        ? "المشروع غير موجود! تأكد من الكود المدخل."
        : undefined;

    return (
      <ErrorPage subtitle={error_title} reload={error_title === undefined} />
    );
  }

  return (
    <>
      {contextHolder}
      {/* Project Info Card */}
      <Card
        className="shadow-lg rounded-xl border-0 text-white"
        style={{
          background: "linear-gradient(135deg, #b79237, #a17924)",
        }}
      >
        <div className="flex items-center justify-between flex-wrap gap-y-6">
          {/* Project Avatar & Name */}
          <div className="flex items-center flex-wrap gap-4">
            <Avatar
              size={80}
              className="bg-white text-[#b79237] font-bold border-2 border-yellow-200"
              icon={<EnvironmentOutlined />}
            />
            <div>
              <h2 className="text-2xl font-bold">{project!.name}</h2>
              <p className="text-yellow-100">كود المشروع: {project!.id}</p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-8 text-center">
            <div>
              <Statistic
                title={<span className="text-yellow-100">عدد المواقع</span>}
                value={project!.locations_count || 0}
                valueStyle={{ color: "#fff", fontWeight: "bold" }}
              />
            </div>
            <div>
              <Statistic
                title={<span className="text-yellow-100">عدد رجال الأمن</span>}
                value={project?.guards_total || 0}
                valueStyle={{ color: "#fff", fontWeight: "bold" }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs
        renderTabBar={(props, DefaultTabBar) => (
          <DefaultTabBar {...props} className="md:ps-2" />
        )}
        className="mt-4"
        direction="rtl"
        items={[
          {
            label: `المواقع`,
            key: "1",
            children: <ProjectLocationsList />,
          },
          {
            label: `رجال الأمن`,
            key: "2",
            children: <ProjectGuardsList />,
          },
        ]}
      />

      {/* Action Buttons */}
      <div className="flex justify-between mt-4 flex-wrap gap-2">
        <div className="flex gap-1 flex-col text-sm"></div>

        <div className="btn-wrapper flex md:justify-end mt-4 flex-wrap gap-4">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              navigate(`/${user!.role}/projects/edit/${project_id}`);
            }}
          >
            تعديل البيانات
          </Button>

          <Popconfirm
            title={
              <div className="text-right">
                <p className="font-semibold text-red-600">
                  هل أنت متأكد من حذف هذا المشروع؟
                </p>
                <div className="text-sm text-gray-600 mt-1">
                  ⚠️ سيتم حذف:
                  <ul className="list-disc ps-8">
                    <li>جميع المواقع</li>
                    <li>الزيارات</li>
                  </ul>
                  المرتبطة بهذا المشروع نهائيًا.
                </div>
              </div>
            }
            onConfirm={handleDelete}
            okText="نعم"
            cancelText="لا"
          >
            <Button
              className="enabled:bg-red-500 enabled:border-red-500 enabled:shadow-[0_2px_0_rgba(0,58,58,0.31)]
            enabled:hover:border-red-400 enabled:hover:bg-red-400 enabled:text-white"
              icon={<DeleteOutlined />}
              loading={deleting}
            >
              حذف المشروع
            </Button>
          </Popconfirm>
        </div>
      </div>
    </>
  );
};

export default ProjectProfile;
