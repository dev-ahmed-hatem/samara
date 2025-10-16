import { Card, Descriptions, Tag, Image } from "antd";
import {
  ExclamationCircleOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import ErrorPage from "@/pages/ErrorPage";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import Loading from "@/components/Loading";
import { useGetViolationQuery } from "@/app/api/endpoints/visits";
import { textify } from "@/utils";
import EditableFieldCard from "./EditableCards";

const ViolationReport = ({ report_id }: { report_id: string }) => {
  const {
    data: violation,
    isFetching,
    isError,
    error: reportError,
  } = useGetViolationQuery(report_id as string);

  if (isFetching) return <Loading />;
  if (isError) {
    const error_title =
      (reportError as axiosBaseQueryError).status === 404
        ? "مخالفة غير موجودة! تأكد من كود المخالفة المدخل."
        : undefined;

    return (
      <ErrorPage subtitle={error_title} reload={error_title === undefined} />
    );
  }
  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-10 text-red-600">
        تقرير مخالفة
      </h1>

      <Card title="تفاصيل المخالفة" className="shadow-md" bordered={false}>
        <Descriptions
          bordered
          column={{ xs: 1, sm: 2 }}
          size="middle"
          labelStyle={{ fontWeight: "bold" }}
        >
          <Descriptions.Item label="الموقع">
            {violation?.project_name} - {violation!.location_name}
          </Descriptions.Item>
          {violation?.security_guard && (
            <Descriptions.Item label="الموظف المخالف">
              {violation!.security_guard}
            </Descriptions.Item>
          )}
          <Descriptions.Item label="نوع المخالفة">
            <Tag color="red">{violation!.violation_type}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="درجة الخطورة">
            <Tag
              color={
                violation!.severity === "عالية"
                  ? "volcano"
                  : violation!.severity === "متوسطة"
                  ? "gold"
                  : "blue"
              }
            >
              {violation!.severity}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="التاريخ">
            <span dir="rtl">{violation!.date}</span>
          </Descriptions.Item>
          <Descriptions.Item label="التاريخ">
            <span dir="rtl">{violation!.time}</span>
          </Descriptions.Item>
          <Descriptions.Item label="وقت الإنشاء">
            {violation!.created_at}
          </Descriptions.Item>
          <Descriptions.Item label="أنشئ بواسطة">
            {violation!.created_by}
          </Descriptions.Item>
          <Descriptions.Item label="رقم المخالفة">
            {violation!.id}
          </Descriptions.Item>
        </Descriptions>

        <div className="mt-6 space-y-4">
          <Card title="الوصف التفصيلي" className="text-lg">
            {textify(violation!.details) ?? <Tag>لا يوجد</Tag>}
          </Card>

          <Card title="شرح المشرف" className="text-lg">
            {textify(violation!.supervisor_explanation) ?? <Tag>لا يوجد</Tag>}
          </Card>

          <Card title="صورة المخالفة">
            {violation!.violation_image ? (
              <Image
                src={violation!.violation_image}
                alt="Violation"
                className="max-h-80"
                preview={{ movable: false, toolbarRender: () => <></> }}
              />
            ) : (
              <Tag>لا يوجد صورة</Tag>
            )}
          </Card>

          <EditableFieldCard
            title="الإجراء"
            field="action"
            value={violation!.action}
            id={violation!.id}
          />

          <EditableFieldCard
            title="التوجيه"
            field="guidance"
            value={violation!.guidance}
            id={violation!.id}
          />

          <EditableFieldCard
            title="الجزاء المطبق"
            field="penalty"
            value={violation!.penalty}
            id={violation!.id}
          />

          <Card title="حالة التأكيد">
            <div className="flex flex-col gap-2 text-base">
              <div className="flex items-center gap-2">
                {violation!.confirmed_by_monitoring ? (
                  <CheckCircleOutlined className="text-green-500" />
                ) : (
                  <ExclamationCircleOutlined className="text-red-500" />
                )}
                <span>تأكيد المتابعة والحفظ</span>
              </div>
              <div>
                {violation!.confirmed_by_monitoring && (
                  <>اخر تعديل: {violation?.updated_at}</>
                )}
              </div>
            </div>
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default ViolationReport;
