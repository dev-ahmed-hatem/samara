import { useState } from "react";
import { Table, Button, Modal, Space, Popconfirm, Card } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useNotification } from "@/providers/NotificationProvider";
import { useParams } from "react-router";
import {
  useGetLocationsQuery,
  useLocationMutation,
} from "@/app/api/endpoints/locations";
import { Location } from "@/types/location";
import Loading from "@/components/Loading";
import ErrorPage from "@/pages/ErrorPage";
import LocationForm, { LocationFormValues } from "./LocationForm";
import { useAppDispatch } from "@/app/redux/hooks";
import { projectsEndpoints } from "@/app/api/endpoints/projects";
import SwitchLocationStatus from "./SwitchLocationStatus";

const ProjectLocationsList = () => {
  const { project_id } = useParams();
  const notification = useNotification();
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  const {
    data: locations,
    isFetching,
    isError,
    refetch,
  } = useGetLocationsQuery({ project_id: project_id });
  const [handleLocation, { isLoading }] = useLocationMutation();

  const handleAdd = () => {
    setEditingLocation(null);
    setIsModalOpen(true);
  };

  const handleEdit = (location: Location) => {
    setEditingLocation(location);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await handleLocation({
        url: `/projects/locations/${id}/`,
        method: "DELETE",
      }).unwrap();
      notification.success({ message: "تم حذف الموقع" });
      refetch();
      dispatch(
        projectsEndpoints.util.invalidateTags([
          { type: "Project", id: parseInt(project_id!) },
        ])
      );
    } catch {
      notification.error({ message: "حدث خطأ أثناء حذف الموقع" });
    }
  };

  const handleSubmit = async (values: LocationFormValues) => {
    try {
      if (editingLocation) {
        // Edit
        await handleLocation({
          url: `/projects/locations/${editingLocation.id}/`,
          method: "PATCH",
          data: values,
        }).unwrap();
        notification.success({ message: "تم تعديل الموقع بنجاح" });
      } else {
        // Add
        await handleLocation({
          url: `/projects/locations/`,
          method: "POST",
          data: { name: values.name, project: project_id },
        }).unwrap();
        notification.success({ message: "تمت إضافة الموقع بنجاح" });
      }
      setIsModalOpen(false);
      refetch();
      dispatch(
        projectsEndpoints.util.invalidateTags([
          { type: "Project", id: parseInt(project_id!) },
        ])
      );
    } catch {
      if (editingLocation) {
        notification.error({ message: "حدث خطأ أثناء تعديل الموقع" });
      } else {
        notification.error({ message: "حدث خطأ أثناء حفظ الموقع" });
      }
    }
  };

  const columns = [
    {
      title: "كود الموقع",
      dataIndex: "id",
      key: "id",
      width: "10%",
    },
    {
      title: "اسم الموقع",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "الحالة",
      dataIndex: "is_active",
      key: "is_active",
      width: "15%",
      render: (_: boolean, record: Location) => (
        <SwitchLocationStatus location={record} />
      ),
    },
    {
      title: "إجراءات",
      key: "actions",
      render: (_: any, record: Location) => (
        <Space>
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            تعديل
          </Button>
          <Popconfirm
            title={
              <div className="text-right">
                <p className="font-semibold text-red-600">
                  هل أنت متأكد من حذف هذا الموقع؟
                </p>
                <div className="text-sm text-gray-600 mt-1">
                  ⚠️ سيتم حذف:
                  <ul className="list-disc ps-8">
                    <li>الزيارات</li>
                  </ul>
                  المرتبطة بهذا المشروع نهائيًا.
                </div>
              </div>
            }
            onConfirm={() => handleDelete(record.id)}
            okText="نعم"
            cancelText="لا"
          >
            <Button danger type="primary" icon={<DeleteOutlined />}>
              حذف
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  if (isFetching) return <Loading />;
  if (isError) return <ErrorPage />;

  return (
    <Card
      title="المواقع"
      extra={
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          إضافة موقع
        </Button>
      }
    >
      <Table
        dataSource={locations}
        columns={columns}
        rowKey="id"
        pagination={false}
        className="calypso-header"
        scroll={{ x: "max-content" }}
        loading={isFetching}
      />

      <Modal
        title={editingLocation ? "تعديل الموقع" : "إضافة موقع"}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={null}
        destroyOnClose
      >
        <LocationForm
          initialValues={editingLocation || undefined}
          onSubmit={handleSubmit}
          loading={isLoading}
        />
      </Modal>
    </Card>
  );
};

export default ProjectLocationsList;
