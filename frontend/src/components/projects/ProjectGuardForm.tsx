import { useGetLocationsQuery } from "@/app/api/endpoints/locations";
import { ProjectGuard, SecurityGuard } from "@/types/scurityGuard";
import { Alert, Button, Form, Radio, Result, Select } from "antd";
import Loading from "../Loading";
import { ShiftType } from "@/types/attendance";
import { useLazyGetSecurityGuardsQuery } from "@/app/api/endpoints/security_guards";
import { useEffect } from "react";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";

export type ProjectGuardFormValues = {
  guard: string;
  location: string;
  shift: ShiftType;
};

const ProjectGuardForm = ({
  project_id,
  initialValues,
  onSubmit,
  loading,
  handlingError,
}: {
  project_id: string;
  initialValues?: ProjectGuard;
  onSubmit: (values: ProjectGuardFormValues) => void;
  loading?: boolean;
  handlingError: axiosBaseQueryError;
}) => {
  const [form] = Form.useForm<ProjectGuardFormValues>();

  const [
    getGuards,
    { data: guards, isFetching: fetchingGuards, isError: guardsError },
  ] = useLazyGetSecurityGuardsQuery();

  const {
    data: locations,
    isFetching: fetchingLocations,
    isError: locationsError,
    refetch: refetchLocations,
  } = useGetLocationsQuery({ project_id: project_id });

  useEffect(() => {
    if (!initialValues) {
      getGuards({ no_pagination: true });
    }
  }, []);

  if (fetchingLocations || fetchingGuards) return <Loading className="h-40" />;
  if (locationsError || guardsError)
    return (
      <Result
        status="error"
        title="فشل تحميل البيانات"
        subTitle="حدث خطأ أثناء جلب البيانات. برجاء المحاولة مرة أخرى."
        extra={[
          <Button type="primary" key="reload" onClick={refetchLocations}>
            إعادة المحاولة
          </Button>,
        ]}
      />
    );

  return (
    <Form
      form={form}
      layout="vertical"
      initialValues={{
        location: initialValues?.location.id ?? null,
        shift: initialValues?.shift ?? null,
      }}
      onFinish={onSubmit}
    >
      {initialValues ? (
        <span className="block my-4 text-lg font-semibold text-gray-700">
          {initialValues.name}
        </span>
      ) : (
        <Form.Item
          name="guard"
          label="رجل الأمن"
          rules={[{ required: true, message: "يرجى اختيار رجل الأمن" }]}
        >
          <Select
            showSearch
            placeholder="اختر رجل الأمن"
            options={(guards as SecurityGuard[])?.map((guard) => ({
              label: guard.name,
              value: guard.id,
            }))}
            optionFilterProp="label"
          />
        </Form.Item>
      )}

      <Form.Item
        name="location"
        label="الموقع"
        rules={[{ required: true, message: "يرجى اختيار الموقع" }]}
      >
        <Select
          showSearch
          placeholder="اختر الموقع"
          options={locations?.map((loc) => ({
            label: loc.name,
            value: loc.id,
          }))}
          optionFilterProp="label"
        />
      </Form.Item>

      <Form.Item
        name="shift"
        label="الوردية"
        rules={[{ required: true, message: "يرجى اختيار الوردية" }]}
      >
        <Radio.Group>
          <Radio.Button value="الوردية الأولى">الوردية الأولى</Radio.Button>
          <Radio.Button value="الوردية الثانية">الوردية الثانية</Radio.Button>
          <Radio.Button value="الوردية الثالثة">الوردية الثالثة</Radio.Button>
        </Radio.Group>
      </Form.Item>

      {(handlingError as axiosBaseQueryError)?.data?.non_field_errors && (
        <div className="w-full mb-4 px-2 sm:px-0">
          <Alert
            message="قيم غير صالحة:"
            description={
              <ul className="list-disc list-inside space-y-1">
                {(handlingError as axiosBaseQueryError)?.data?.non_field_errors}
              </ul>
            }
            type="error"
            showIcon
            className="rounded-lg shadow-sm"
          />
        </div>
      )}

      <Form.Item style={{ textAlign: "center" }}>
        <Button type="primary" htmlType="submit" loading={loading}>
          {initialValues ? "تعديل" : "إضافة"}
        </Button>
      </Form.Item>
    </Form>
  );
};

export default ProjectGuardForm;
