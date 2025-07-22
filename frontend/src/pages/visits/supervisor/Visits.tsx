import React, { useState } from "react";
import { Card, Input, Empty, Button } from "antd";
import { CheckCircleOutlined, ClockCircleOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import dayjs from "dayjs";

// Type for a single visit item
interface Visit {
  id: string;
  title: string;
  description: string;
}

const schedules = [
  { id: "1", title: "زيارة مطعم", description: "تفتيش النظافة" },
  {
    id: "2",
    title: "زيارة مستشفى",
    description: "مراجعة الإجراءات",
  },
];

const completedSchedules = [
  {
    id: "3",
    title: "زيارة مدرسة",
    description: "تمت بنجاح الساعة 10 صباحًا",
  },
];

const selectedDate = dayjs();

const VisitsPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState<string>("");

  const filterVisits = (visits: Visit[]) =>
    visits.filter(
      (v) =>
        v.title.toLowerCase().includes(searchText.toLowerCase()) ||
        v.description.toLowerCase().includes(searchText.toLowerCase())
    );

  const VisitCard = ({
    visit,
    type,
  }: {
    visit: Visit;
    type: "scheduled" | "completed";
  }) => {
    const isCompleted = type === "completed";

    return (
      <div
        className={`border p-4 rounded-2xl shadow-sm transition hover:shadow-md ${
          isCompleted
            ? "border-green-500 bg-green-50"
            : "border-blue-500 bg-white"
        }`}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
          <div>
            <h3 className="text-lg font-semibold">{visit.title}</h3>
            <p className="text-gray-600 text-sm">{visit.description}</p>
          </div>
          {!isCompleted && (
            <div className="flex gap-2 mt-2 md:mt-0">
              <Button
                type="primary"
                className="bg-blue-600"
                onClick={() => navigate(`/start-visit/${visit.id}`)}
              >
                بدء الزيارة
              </Button>
              <Button
                danger
                onClick={() => navigate(`/report-violation/${visit.id}`)}
              >
                إبلاغ عن مخالفة
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}

      <div className="flex justify-between flex-wrap mb-4">
        <Input.Search
          placeholder="ابحث ضمن الزيارات..."
          className="w-full max-w-md"
          allowClear={true}
          size="large"
          // onSearch={onSearch}
          // defaultValue={search}
          // onClear={() => setSearch("")}
        />
      </div>

      {/* Scheduled Visits */}
      <Card
        className="shadow-md"
        title={
          <div className="flex items-center gap-2 text-blue-600">
            <ClockCircleOutlined />
            زيارات مجدولة ليوم {selectedDate.format("DD-MM-YYYY")}
          </div>
        }
      >
        <div className="grid gap-4">
          {filterVisits(schedules).length > 0 ? (
            filterVisits(schedules).map((visit) => (
              <VisitCard key={visit.id} visit={visit} type="scheduled" />
            ))
          ) : (
            <Empty description="لا توجد زيارات مجدولة" />
          )}
        </div>
      </Card>

      {/* Completed Visits */}
      <Card
        className="shadow-md border border-green-400"
        title={
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircleOutlined />
            زيارات مكتملة ليوم {selectedDate.format("DD-MM-YYYY")}
          </div>
        }
      >
        <div className="grid gap-4">
          {filterVisits(completedSchedules).length > 0 ? (
            filterVisits(completedSchedules).map((visit) => (
              <VisitCard key={visit.id} visit={visit} type="completed" />
            ))
          ) : (
            <Empty description="لا توجد زيارات مكتملة" />
          )}
        </div>
      </Card>
    </div>
  );
};

export default VisitsPage;
