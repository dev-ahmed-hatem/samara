import { useEffect, useState } from "react";
import { Card, Avatar, Button, Switch, Popconfirm, Tabs } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useParams, useNavigate } from "react-router";
import Loading from "@/components/Loading";
import ErrorPage from "@/pages/ErrorPage";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import { useNotification } from "@/providers/NotificationProvider";
import {
  securityGuardsEndpoints,
  useGetSecurityGuardQuery,
  useSecurityGuardMutation,
  useSwitchGuardActiveMutation,
} from "@/app/api/endpoints/security_guards";
import { useAppDispatch, useAppSelector } from "@/app/redux/hooks";
import { SecurityGuard } from "@/types/scurityGuard";
import SecurityGuardShifts from "@/components/security-guards/SecurityGuardShifts";

const SecurityGuardProfile: React.FC = () => {
  const navigate = useNavigate();
  const notification = useNotification();
  const { guard_id } = useParams();
  const user = useAppSelector((state) => state.auth.user);
  const dispatch = useAppDispatch();

  const {
    data: guard,
    isFetching,
    isError,
    error: guardError,
  } = useGetSecurityGuardQuery({ id: guard_id as string, format: "detailed" });

  const [
    switchActive,
    { data: switchRes, isLoading: switching, isError: switchError },
  ] = useSwitchGuardActiveMutation();

  const [
    deleteGuard,
    {
      isError: deleteIsError,
      error: deleteError,
      isLoading: deleting,
      isSuccess: deleted,
    },
  ] = useSecurityGuardMutation();

  const [isActive, setIsActive] = useState<boolean | null>(null);

  const toggleStatus = () => {
    switchActive(guard_id as string);
  };

  const handleDelete = () => {
    deleteGuard({
      url: `/employees/security-guards/${guard_id}/`,
      method: "DELETE",
      data: {},
    });
  };

  useEffect(() => {
    if (guard) setIsActive(guard.is_active);
  }, [guard]);

  useEffect(() => {
    if (switchError) {
      notification.error({
        message: "حدث خطأ في تغيير الحالة ! برجاء إعادة المحاولة",
      });
    }
  }, [switchError]);

  useEffect(() => {
    if (switchRes) {
      setIsActive(switchRes.is_active);
      dispatch(
        securityGuardsEndpoints.util.updateQueryData(
          "getSecurityGuard",
          { id: guard_id as string, format: "detailed" },
          (draft: SecurityGuard) => {
            draft.is_active = switchRes.is_active;
          }
        )
      );
      notification.success({
        message: "تم تغيير الحالة بنجاح",
      });
    }
  }, [switchRes]);

  useEffect(() => {
    if (deleteIsError) {
      let message = (deleteError as axiosBaseQueryError)?.data.detail ?? null;
      notification.error({
        message:
          message ?? "حدث خطأ أثناء حذف فرد الأمن ! برجاء إعادة المحاولة",
      });
    }
  }, [deleteIsError]);

  useEffect(() => {
    if (deleted) {
      notification.success({
        message: "تم حذف فرد الأمن بنجاح",
      });

      navigate(`/${user!.role}/security-guards`);
    }
  }, [deleted]);

  if (isFetching) return <Loading />;
  if (isError) {
    const error_title =
      (guardError as axiosBaseQueryError).status === 404
        ? "فرد الأمن غير موجود! تأكد من الكود المدخل."
        : undefined;

    return (
      <ErrorPage subtitle={error_title} reload={error_title === undefined} />
    );
  }

  return (
    <>
      <Card className="shadow-lg rounded-xl">
        <div className="flex items-center justify-between flex-wrap gap-y-6">
          {/* Avatar */}
          <div className="flex items-center flex-wrap gap-4">
            <Avatar size={80} className="bg-calypso font-semibold">
              {guard!.employee_id}
            </Avatar>

            <div>
              <h2 className="text-xl font-bold">{guard!.name}</h2>
              <p className="text-gray-500">
                الرقم الوظيفي: {guard!.employee_id}
              </p>
            </div>
          </div>

          {/* Status */}
          {isActive !== null && (
            <div className="flex items-center gap-2">
              <Switch
                checked={isActive!}
                onChange={toggleStatus}
                checkedChildren="نشط"
                unCheckedChildren="غير نشط"
                loading={switching}
              />
            </div>
          )}
        </div>
      </Card>

      <Tabs
        renderTabBar={(props, DefaultTabBar) => (
          <DefaultTabBar {...props} className="md:ps-2" />
        )}
        className="mt-4"
        direction="rtl"
        items={[
          {
            label: `المواقع والورديات`,
            key: "1",
            children: <SecurityGuardShifts guard={guard!} />,
          },
        ]}
      />

      <div className="flex justify-between mt-4 flex-wrap gap-2">
        {/* Meta Data */}
        <div className="flex gap-1 flex-col text-sm"></div>

        {/* Action Buttons */}
        <div className="btn-wrapper flex md:justify-end mt-4 flex-wrap gap-4">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              navigate(`/${user!.role}/security-guards/edit/${guard_id}`);
            }}
          >
            تعديل البيانات
          </Button>

          <Popconfirm
            title="هل أنت متأكد من حذف هذا الفرد؟"
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
              حذف فرد الأمن
            </Button>
          </Popconfirm>
        </div>
      </div>
    </>
  );
};

export default SecurityGuardProfile;
