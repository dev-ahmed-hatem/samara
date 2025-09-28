import { useState } from "react";
import { Table, Button, Modal, Popconfirm, Result, Card } from "antd";
import type { ColumnsType } from "antd/es/table";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import { useParams } from "react-router";
import {
  projectsEndpoints,
  useGetProjectGuardsQuery,
} from "@/app/api/endpoints/projects";
import Loading from "@/components/Loading";
import ProjectGuardForm, { ProjectGuardFormValues } from "./ProjectGuardForm";
import { ProjectGuard } from "@/types/scurityGuard";
import { tablePaginationConfig } from "@/utils/antd";
import { useGetLocationsQuery } from "@/app/api/endpoints/locations";
import { ShiftType } from "@/types/attendance";
import { useLocationShiftMutation } from "@/app/api/endpoints/location_shifts";
import { useNotification } from "@/providers/NotificationProvider";
import { useAppDispatch } from "@/app/redux/hooks";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";

type ControlsType = {
  filters: {
    location?: string;
    shift?: ShiftType;
  };
} | null;

const ProjectGuardsList: React.FC = () => {
  const { project_id } = useParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGuard, setEditingGuard] = useState<ProjectGuard | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const notification = useNotification();
  const dispatch = useAppDispatch();

  const [controls, setControls] = useState<ControlsType>();

  const { data, isLoading, isFetching, isError, refetch } =
    useGetProjectGuardsQuery({
      no_pagination: false,
      project: project_id,
      page,
      page_size: pageSize,
      location: controls?.filters.location,
      shift: controls?.filters.shift,
    });

  const {
    data: locations,
    isFetching: fetchingLocations,
    isError: locationsError,
    refetch: refetchLocations,
  } = useGetLocationsQuery({ project_id: project_id });

  const [handleAssignment, { isLoading: handling, error: handlingError }] =
    useLocationShiftMutation();

  const handleSubmit = async (values: ProjectGuardFormValues) => {
    try {
      if (editingGuard) {
        // Edit
        await handleAssignment({
          url: `/employees/location-shifts/${editingGuard.id}/`,
          method: "PATCH",
          data: values,
        }).unwrap();
        notification.success({ message: "تم تعديل رجل الأمن" });
      } else {
        // Add
        await handleAssignment({
          url: `/employees/location-shifts/`,
          method: "POST",
          data: values,
        }).unwrap();
        notification.success({ message: "تمت إضافة رجل الأمن" });
      }
      setIsModalOpen(false);
      dispatch(
        projectsEndpoints.util.invalidateTags([
          { type: "Project", id: parseInt(project_id!) },
          { type: "ProjectGuard", id: "LIST" },
        ])
      );
    } catch {
      if (editingGuard) {
        notification.error({ message: "حدث خطأ أثناء تعديل رجل الأمن" });
      } else {
        notification.error({ message: "حدث خطأ أثناء حفظ رجل الأمن" });
      }
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await handleAssignment({
        url: `/employees/location-shifts/${id}/`,
        method: "DELETE",
      }).unwrap();
      notification.success({ message: "تم حذف رجل الأمن" });
      refetch();
      dispatch(
        projectsEndpoints.util.invalidateTags([
          { type: "Project", id: parseInt(project_id!) },
          { type: "ProjectGuard", id: "LIST" },
        ])
      );
    } catch {
      notification.error({ message: "حدث خطأ أثناء حذف رجل الأمن" });
    }
  };

  const columns: ColumnsType<ProjectGuard> = [
    {
      title: "#",
      key: "id",
      render: (_, __, index) => (page - 1) * pageSize + (index + 1),
    },
    {
      title: "الاسم",
      dataIndex: "name",
      key: "name",
    },
    {
      title: "الموقع",
      dataIndex: ["location", "name"],
      key: "location",
      filters: locations?.map((loc) => ({ text: loc.name, value: loc.id })),
      defaultFilteredValue: controls?.filters?.location?.split(",") ?? [],
    },
    {
      title: "الوردية",
      dataIndex: "shift",
      key: "shift",
      filters: [
        { text: "الوردية الأولى", value: "الوردية الأولى" },
        { text: "الوردية الثانية", value: "الوردية الثانية" },
        { text: "الوردية الثالثة", value: "الوردية الثالثة" },
      ],
      defaultFilteredValue: controls?.filters?.shift?.split(",") ?? [],
    },
    {
      title: "الإجراءات",
      key: "actions",
      render: (_, record) => (
        <div className="flex gap-2">
          <Button
            type="primary"
            icon={<EditOutlined />}
            onClick={() => {
              setEditingGuard(record);
              setIsModalOpen(true);
            }}
          >
            تعديل
          </Button>
          <Popconfirm
            title="هل أنت متأكد من حذف هذا الفرد؟"
            onConfirm={() => handleDelete(record.id)}
            okText="نعم"
            cancelText="لا"
          >
            <Button
              type="primary"
              danger
              icon={<DeleteOutlined />}
              loading={handling}
            >
              حذف
            </Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  if (isLoading) return <Loading />;
  if (isError || locationsError)
    return (
      <Result
        status="error"
        title="فشل تحميل البيانات"
        subTitle="حدث خطأ أثناء جلب البيانات. برجاء المحاولة مرة أخرى."
        extra={[
          <Button
            type="primary"
            key="reload"
            onClick={isError ? refetch : refetchLocations}
          >
            إعادة المحاولة
          </Button>,
        ]}
      />
    );

  return (
    <Card
      title="رجال الأمن"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            setEditingGuard(null);
            setIsModalOpen(true);
          }}
        >
          إضافة رجل أمن
        </Button>
      }
    >
      <Table
        rowKey="id"
        columns={columns}
        dataSource={data?.data || []}
        pagination={tablePaginationConfig({
          total: data?.count,
          current: data?.page,
          pageSize,
          onChange(page, pageSize) {
            setPage(page);
            setPageSize(pageSize);
          },
        })}
        onChange={(_, filters) => {
          setControls({
            filters: Object.fromEntries(
              Object.entries(filters).map(([filter, values]) => [
                filter,
                (values as string[])?.join(),
              ])
            ),
          });
        }}
        scroll={{ x: "max-content" }}
        className="calypso-header"
        loading={isFetching || fetchingLocations}
      />

      <Modal
        title={editingGuard ? "تعديل بيانات رجل الأمن" : "إضافة رجل أمن"}
        open={isModalOpen}
        footer={null}
        onCancel={() => setIsModalOpen(false)}
        destroyOnClose
      >
        <ProjectGuardForm
          project_id={project_id as string}
          initialValues={editingGuard || undefined}
          onSubmit={handleSubmit}
          handlingError={handlingError as axiosBaseQueryError}
        />
      </Modal>
    </Card>
  );
};

export default ProjectGuardsList;
