import { useState, useEffect } from "react";
import {
  Card,
  Table,
  Button,
  Modal,
  Form,
  Select,
  Row,
  Col,
  Popconfirm,
  Radio,
  Spin,
  Alert,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  LoadingOutlined,
} from "@ant-design/icons";

import { useGetProjectsQuery } from "@/app/api/endpoints/projects";
import { useLazyGetLocationsQuery } from "@/app/api/endpoints/locations";
import { useGetSecurityGuardShiftsQuery } from "@/app/api/endpoints/security_guards";
import { useNotification } from "@/providers/NotificationProvider";
import { SecurityGuard } from "@/types/scurityGuard";
import { useLocationShiftMutation } from "@/app/api/endpoints/location_shifts";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import { handleServerErrors } from "@/utils/handleForm";

const SecurityGuardShifts = ({ guard }: { guard: SecurityGuard }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [message, setMessage] = useState<string | null>(null);

  const [projectId, setProjectId] = useState<number | null>(null);
  const notification = useNotification();

  const { data: projects, isFetching: fetchingProjects } =
    useGetProjectsQuery();
  const [getLocations, { data: locations, isFetching: fetchingLocations }] =
    useLazyGetLocationsQuery();

  const { data: assignments, isFetching: fetchingAssignments } =
    useGetSecurityGuardShiftsQuery(guard.id);

  const [
    handleAssignment,
    {
      isLoading: handling,
      error: handlingError,
      isError: handlingIsError,
      isSuccess: handlingSuccess,
    },
  ] = useLocationShiftMutation();

  const handleAdd = (values: any) => {
    const data = {
      location: values.location,
      guard: guard.id,
      shift: values.shift,
    };

    setMessage("تم إضافة التكليف");

    handleAssignment({
      url: `/employees/location-shifts/`,
      method: "POST",
      data,
    });
  };

  const handleDelete = (assignment_id: string) => {
    setMessage("تم حذف التكليف");

    handleAssignment({
      url: `/employees/location-shifts/${assignment_id}/`,
      method: "DELETE",
    });
  };

  const columns = [
    {
      title: "المشروع",
      dataIndex: "project",
      key: "project",
    },
    {
      title: "الموقع",
      dataIndex: "location",
      key: "location",
    },
    {
      title: "الوردية",
      dataIndex: "shift",
      key: "shift",
    },
    {
      title: "إجراءات",
      key: "actions",
      render: (_: any, record: any) => (
        <Popconfirm
          title="هل أنت متأكد من حذف هذا التكليف؟"
          onConfirm={() => handleDelete(record.id)}
          okText="نعم"
          cancelText="لا"
        >
          <Button
            danger
            size="small"
            icon={<DeleteOutlined />}
            loading={handling}
          >
            حذف
          </Button>
        </Popconfirm>
      ),
    },
  ];

  useEffect(() => {
    if (projectId) {
      getLocations({ project_id: projectId });
    }
  }, [projectId]);

  useEffect(() => {
    if (handlingSuccess) {
      notification.success({ message: message ?? "تم تنفيذ الإجراء" });
      setModalOpen(false);
      form.resetFields();
    }
  }, [handlingSuccess]);

  useEffect(() => {
    if (handlingIsError) {
      const error = handlingError as axiosBaseQueryError;
      if (error.status == 400) {
        handleServerErrors({
          errorData: error.data as Record<string, string[]>,
          form,
        });
      }

      notification.error({ message: "خطأ في إضافة رجل الأمن!" });
    }
  }, [handlingIsError]);

  return (
    <Card
      title="المواقع والورديات"
      extra={
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setModalOpen(true)}
        >
          إضافة تكليف
        </Button>
      }
    >
      <Table
        columns={columns}
        dataSource={assignments || []}
        rowKey="id"
        loading={fetchingAssignments}
        pagination={false}
        className="calypso-header"
      />

      {/* Modal for Add */}
      <Modal
        title="إضافة وردية لموقع"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        onOk={() => form.submit()}
        confirmLoading={handling}
        okText="إضافة"
        cancelText="إلغاء"
      >
        <Form form={form} layout="vertical" onFinish={handleAdd}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                label={
                  <div className="flex gap-2 items-center">
                    <span>اختر المشروع</span>
                    {fetchingProjects && (
                      <Spin size="small" indicator={<LoadingOutlined spin />} />
                    )}
                  </div>
                }
                name="project"
                className="col-span-1"
                rules={[{ required: true, message: "الرجاء اختيار المشروع" }]}
              >
                <Select
                  placeholder="اختر المشروع"
                  onChange={(value) => {
                    setProjectId(value);
                    form.setFieldValue("location", undefined);
                  }}
                >
                  {projects?.map((p) => (
                    <Select.Option key={p.id} value={p.id}>
                      {p.name}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label={
                  <div className="flex gap-2 items-center">
                    <span>اختر الموقع</span>
                    {fetchingLocations && (
                      <Spin size="small" indicator={<LoadingOutlined spin />} />
                    )}
                  </div>
                }
                name="location"
                className="col-span-1"
                rules={[{ required: true, message: "الرجاء اختيار الموقع" }]}
              >
                <Select
                  placeholder="اختر الموقع"
                  value={location ?? undefined}
                  disabled={!projectId}
                >
                  {projectId &&
                    locations?.map((loc) => (
                      <Select.Option key={loc.id} value={loc.id}>
                        {loc.name}
                      </Select.Option>
                    ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item
                label="الوردية"
                name="shift"
                className="col-span-1"
                rules={[{ required: true, message: "الرجاء اختيار الوردية" }]}
              >
                <Radio.Group className="flex">
                  <Radio.Button value="الوردية الأولى">الأولى</Radio.Button>
                  <Radio.Button value="الوردية الثانية">الثانية</Radio.Button>
                  <Radio.Button value="الوردية الثالثة">الثالثة</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>
          </Row>
          {(handlingError as axiosBaseQueryError)?.data?.non_field_errors && (
            <div className="w-full mb-4 px-2 sm:px-0">
              <Alert
                message="قيم غير صالحة:"
                description={
                  <ul className="list-disc list-inside space-y-1">
                    {
                      (handlingError as axiosBaseQueryError)?.data
                        ?.non_field_errors
                    }
                  </ul>
                }
                type="error"
                showIcon
                className="rounded-lg shadow-sm"
              />
            </div>
          )}
        </Form>
      </Modal>
    </Card>
  );
};

export default SecurityGuardShifts;
