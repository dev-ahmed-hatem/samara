import React, { useState } from "react";
import { Card, Select, Form, Input, Button, Radio, message, Table } from "antd";
import type { RadioChangeEvent } from "antd";
import dayjs from "dayjs";
import { AttendanceStatus, EmployeeAttendance } from "@/types/attendance";
import { Employee } from "@/types/employee";

const dummyProjects = [
  { id: 1, name: "مشروع الرياض" },
  { id: 2, name: "مشروع جدة" },
];

const dummyLocations: Record<number, Array<string>> = {
  1: ["موقع 1 - الرياض", "موقع 2 - الرياض"],
  2: ["موقع 1 - جدة"],
};

const dummyEmployees: Employee[] = [
  // { id: "1", name: "أحمد محمد" },
  // { id: "2", name: "سعيد علي" },
  // { id: "3", name: "فهد عبد الله" },
];

const AttendanceRecords: React.FC = () => {
  const [projectId, setProjectId] = useState<number | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [attendance, setAttendance] = useState<
    Record<number, EmployeeAttendance>
  >({});
  const [shift, setShift] = useState(null);
  const [form] = Form.useForm();

  // Table Columns
  const columns = [
    {
      title: "الموظف",
      dataIndex: "name",
    },
    {
      title: "الحالة",
      dataIndex: "status",
      render: (text: string, record: any) => (
        <Radio.Group
          value={attendance[record.id]?.status}
          onChange={(e) => handleStatusChange(record.id, e)}
          options={["حاضر", "متأخر", "غائب"]}
          optionType="button"
          buttonStyle="solid"
        />
      ),
    },
    {
      title: "ملاحظات",
      dataIndex: "notes",
      render: (text: string, record: any) => (
        <Input
          className="mt-2"
          placeholder="ملاحظات"
          value={attendance[record.id]?.note}
          onChange={(e) => handleNoteChange(record.id, e)}
        />
      ),
    },
  ];

  const handleStatusChange = (id: number, e: RadioChangeEvent) => {
    setAttendance((prev) => ({
      ...prev,
      [id]: { ...prev[id], status: e.target.value },
    }));
  };

  const handleNoteChange = (
    id: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setAttendance((prev) => ({
      ...prev,
      [id]: { ...prev[id], note: e.target.value },
    }));
  };

  const handleSave = () => {
    if (!projectId || !location) {
      message.warning("يرجى اختيار المشروع والموقع أولاً");
      return;
    }

    console.log("Saved Attendance:", {
      projectId,
      location,
      records: attendance,
    });

    message.success("تم حفظ الحضور بنجاح");
  };

  const currentDate = dayjs().format("YYYY-MM-DD");

  return (
    <div className="space-y-6">
      {/* Section 1 */}
      <Card title="تفاصيل الحضور" className="shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Form
            layout="vertical"
            form={form}
            className="col-span-full md:col-span-3"
          >
            {/* Date */}
            <Form.Item label="تاريخ اليوم">
              <div className="font-semibold">{currentDate}</div>
            </Form.Item>

            {/* Project Select */}
            <Form.Item label="اختر المشروع" required>
              <Select
                placeholder="اختر المشروع"
                onChange={(value) => {
                  setProjectId(value);
                  setLocation(null); // reset location
                }}
                value={projectId ?? undefined}
              >
                {dummyProjects.map((project) => (
                  <Select.Option key={project.id} value={project.id}>
                    {project.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            {/* Location Select */}
            <Form.Item label="اختر الموقع" required>
              <Select
                placeholder="اختر الموقع"
                onChange={(value) => setLocation(value)}
                value={location ?? undefined}
                disabled={!projectId}
              >
                {projectId &&
                  dummyLocations[projectId]?.map((loc) => (
                    <Select.Option key={loc} value={loc}>
                      {loc}
                    </Select.Option>
                  ))}
              </Select>
            </Form.Item>

            {/* Shift Select */}
            <Form.Item label="اختر الوردية" required name="shift">
              <Radio.Group onChange={(event) => console.log(event.target.value)}>
                <Radio.Button value="الأولى">الأولى</Radio.Button>
                <Radio.Button value="الثانية">الثانية</Radio.Button>
                <Radio.Button value="الثالثة">الثالثة</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Form>
        </div>
      </Card>

      {/* Section 2 */}
      {projectId && location && shift && (
        <Card title="حالة الموظفين" className="shadow-md">
          <div className="space-y-6">
            <Table
              columns={columns}
              dataSource={dummyEmployees}
              pagination={false}
              className="calypso-header"
              scroll={{ x: "max-content" }}
            />
          </div>

          {/* Save Button */}
          <div className="mt-6 text-end">
            <Button type="primary" onClick={handleSave} size="large">
              حفظ
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
};

export default AttendanceRecords;
