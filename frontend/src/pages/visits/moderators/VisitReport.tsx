import { Card, Descriptions, Tag, Typography, Collapse, Image } from "antd";
import { FileOutlined } from "@ant-design/icons";
import { useParams } from "react-router";
import { useGetVisitReportQuery } from "@/app/api/endpoints/visits";
import Loading from "@/components/Loading";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import ErrorPage from "@/pages/ErrorPage";

const { Text, Paragraph } = Typography;
const { Panel } = Collapse;

const VisitReport = ({report_id}: {report_id: string}) => {

  const {
    data: report,
    isFetching,
    isError,
    error: reportError,
  } = useGetVisitReportQuery(report_id as string);
  const evaluationSections = [
    {
      label: "تواجد الحارس في موقعه",
      value: report?.guard_presence,
      notes: report?.guard_presence_notes,
      attachment: report?.guard_presence_attachment,
    },
    {
      label: "نظافة الزي الرسمي",
      value: report?.uniform_cleanliness,
      notes: report?.uniform_cleanliness_notes,
      attachment: report?.uniform_cleanliness_attachment,
    },
    {
      label: "سجلات الحضور والانصراف والسجلات الخاصة بالموقع",
      value: report?.attendance_records,
      notes: report?.attendance_records_notes,
      attachment: report?.attendance_records_attachment,
    },
    {
      label: "الانضباط في تسليم واستلام الورديات",
      value: report?.shift_handover,
      notes: report?.shift_handover_notes,
      attachment: report?.shift_handover_attachment,
    },
    {
      label: "الإضاءة حول محيط الموقع",
      value: report?.lighting,
      notes: report?.lighting_notes,
      attachment: report?.lighting_attachment,
    },
    {
      label: "كاميرات المراقبة",
      value: report?.cameras,
      notes: report?.cameras_notes,
      attachment: report?.cameras_attachment,
    },
    {
      label: "السيارات الأمنية",
      value: report?.security_vehicles,
      notes: report?.security_vehicles_notes,
      attachment: report?.security_vehicles_attachment,
    },
    {
      label: "عمل أجهزة الاتصال اللاسلكي",
      value: report?.radio_devices,
      notes: report?.radio_devices_notes,
      attachment: report?.radio_devices_attachment,
    },
    {
      label: "أخرى",
      value: report?.other,
      notes: report?.other_notes,
      attachment: report?.other_attachment,
    },
  ];

  if (isFetching) return <Loading />;
  if (isError) {
    const error_title =
      (reportError as axiosBaseQueryError).status === 404
        ? "تقرير غير موجود! تأكد من كود تقرير الزيارة المدخل."
        : undefined;

    return (
      <ErrorPage subtitle={error_title} reload={error_title === undefined} />
    );
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-10 text-calypso">
        تقرير زيارة ميدانية
      </h1>

      {/* Summary Info */}
      <Card className="shadow-sm">
        <Descriptions bordered column={{ xs: 1, sm: 2 }}>
          <Descriptions.Item label="الموقع">
            {report?.visit.project_name}
          </Descriptions.Item>
          <Descriptions.Item label="الموقع">
            {report?.visit.location_name}
          </Descriptions.Item>
          <Descriptions.Item label="المشرف">
            {report?.visit.employee}
          </Descriptions.Item>
          <Descriptions.Item label="وقت الإنشاء">
            {report?.created_at}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* Evaluation Sections */}
      <Card title="التقييمات" className="shadow-sm">
        <Collapse accordion>
          {evaluationSections.map((section, idx) => (
            <Panel
              header={
                <div className="flex justify-between w-full">
                  <Text strong>{section.label}</Text>
                  <Tag color={section.value === "جيد" ? "green" : "red"}>
                    {section.value}
                  </Tag>
                </div>
              }
              key={idx}
            >
              <Paragraph>
                {section.notes != null ? (
                  <Text type="secondary" className="text-black text-lg mb-2">
                    {section.notes}
                  </Text>
                ) : (
                  <Tag className="text-base">لا توجد ملاحظات</Tag>
                )}
              </Paragraph>

              {section.attachment && (
                <div className="mt-2">
                  {section.attachment.endsWith(".jpg") ||
                  section.attachment.endsWith(".png") ? (
                    <Image
                      width={200}
                      src={section.attachment}
                      preview={{ movable: false, toolbarRender: () => <></> }}
                    />
                  ) : (
                    <a
                      href={section.attachment}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <FileOutlined /> عرض المرفق
                    </a>
                  )}
                </div>
              )}
            </Panel>
          ))}
        </Collapse>
      </Card>

      {/* Global Notes */}
      <Card title="ملاحظات عامة" className="shadow-sm">
        {!report?.client_notes && !report?.supervisor_notes && (
          <Tag className="text-lg">لا توجد ملاحظات</Tag>
        )}
        {report?.client_notes && (
          <Paragraph>
            <Text strong>توجيهات العميل:</Text> {report?.client_notes}
          </Paragraph>
        )}
        {report?.supervisor_notes && (
          <Paragraph>
            <Text strong>ملاحظات المشرف:</Text> {report?.supervisor_notes}
          </Paragraph>
        )}
      </Card>
    </div>
  );
};

export default VisitReport;
