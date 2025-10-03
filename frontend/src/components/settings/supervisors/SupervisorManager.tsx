import { useEffect, useState } from "react";
import { Button, Table, Popconfirm, Card, Tag, Form } from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  LockOutlined,
} from "@ant-design/icons";
import ErrorPage from "@/pages/ErrorPage";
import Loading from "@/components/Loading";
import { useNotification } from "@/providers/NotificationProvider";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import { useGetUsersQuery, useUserMutation } from "@/app/api/endpoints/users";
import { User } from "@/types/user";
import SupervisorForm from "./SupervisorForm";
import { handleServerErrors } from "@/utils/handleForm";

type SupervisorFormProps = {
  username: string;
  password: string;
  password2: string;
  name: string;
  phone: string;
  national_id: string;
  employee_id: string;
  position: string;
};

const SupervisorManager = () => {
  const notification = useNotification();
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [changePassword, setChangePassword] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState<string>("");
  const [form] = Form.useForm<SupervisorFormProps>();

  const {
    data: users,
    isFetching,
    isError,
  } = useGetUsersQuery({ no_pagination: true, role: "supervisor" });

  const [
    handleUser,
    {
      isLoading: handlingUser,
      isError: userIsError,
      isSuccess: userIsSuccess,
      error: userError,
    },
  ] = useUserMutation();

  const handleAdd = (values: SupervisorFormProps) => {
    setMessage("تم إضافة المشرف");
    const { username, password, password2, ...rest } = values;
    const data = {
      username: username,
      password: password,
      password2: password2,
      role: "supervisor" as const,
      employee_data: { ...rest },
    };

    handleUser({ data: data, method: "POST" });
  };

  const handleEdit = (updated: SupervisorFormProps) => {
    changePassword
      ? setMessage("تم تغيير كلمة المرور")
      : setMessage("تم تعديل اسم المستخدم");

    const { username, password, password2, ...rest } = updated;
    const data = {
      username: username,
      password: password,
      password2: password2,
      employee_data: { ...rest },
    };

    handleUser({
      data: data,
      method: "PATCH",
      url: `/users/users/${editingUser!.id}/`,
    });
  };

  const handleDelete = (id: string) => {
    setMessage("تم حذف المشرف");
    handleUser({
      method: "DELETE",
      url: `/users/users/${id}/`,
    });
  };

  const columns = [
    {
      title: "الاسم",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "اسم المستخدم",
      dataIndex: "username",
      key: "username",
    },
    {
      title: "الرقم الوظيفي",
      dataIndex: ["employee_profile", "employee_id"],
      key: "employee_id",
    },
    {
      title: "الإجراءات",
      key: "actions",
      render: (_: any, record: User) => (
        <div className="flex gap-2">
          <Button
            icon={<EditOutlined />}
            onClick={() => {
              setEditingUser(record);
              setIsModalOpen(true);
            }}
            title="تعديل المشرف"
          />
          <Button
            icon={<LockOutlined />}
            onClick={() => {
              setEditingUser(record);
              setIsModalOpen(true);
              setChangePassword(true);
            }}
            title="تغيير كلمة المرور"
          />
          <Popconfirm
            title="هل أنت متأكد من الحذف؟"
            onConfirm={() => handleDelete(record.id)}
            okText="نعم"
            cancelText="إلغاء"
          >
            <Button danger icon={<DeleteOutlined />} title="حذف المشرف" />
          </Popconfirm>
        </div>
      ),
    },
  ];

  useEffect(() => {
    if (userIsError) {
      const error = userError as axiosBaseQueryError;
      const error_data = {
        ...error.data,
        ...(error.data?.employee_data ?? {}),
      };
      if (error.status == 400) {
        handleServerErrors({
          errorData: error_data as Record<string, string[]>,
          form,
        });
      } else {
        let message = error.data.detail ?? null;
        notification.error({ message: message ?? "خطأ في تنفيذ الإجراء!" });
      }
    }
  }, [userIsError]);

  useEffect(() => {
    if (userIsSuccess) {
      notification.success({
        message: message,
      });
      setIsModalOpen(false);
      setChangePassword(false);
      form.resetFields();
    }
  }, [userIsSuccess]);

  if (isFetching) return <Loading />;
  if (isError) return <ErrorPage />;

  return (
    <Card title="إدارة المشرفين" className="shadow-md">
      <div className="flex justify-end mb-4">
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingUser(null);
            setChangePassword(false);
            setIsModalOpen(true);
          }}
          loading={handlingUser}
          className="bg-gradient-to-l from-green-800 to-green-600 
        hover:from-green-700 hover:to-green-500 shadow-[0_2px_0_rgba(0,58,58,0.31)]
         transition-all duration-200"
        >
          إضافة مشرف
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={users}
        pagination={false}
        scroll={{ x: "max-content" }}
      />

      <SupervisorForm
        open={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
        }}
        onSubmit={editingUser || changePassword ? handleEdit : handleAdd}
        initialValues={editingUser || undefined}
        loading={handlingUser}
        form={form}
        changePassword={changePassword}
      />
    </Card>
  );
};

export default SupervisorManager;
