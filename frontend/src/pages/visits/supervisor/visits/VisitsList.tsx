import React, { useEffect, useState } from "react";
import { Card, Input, Empty } from "antd";
import { CheckCircleOutlined, CalendarOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import VisitCard from "@/components/visits/VisitCard";
import ErrorPage from "@/pages/ErrorPage";
import Loading from "@/components/Loading";
import { useGetVisitsQuery } from "@/app/api/endpoints/visits";
import { useAppSelector } from "@/app/redux/hooks";
import { Visit } from "@/types/visit";

const selectedDate = dayjs();

type FilteredVisitsType = {
  scheduled: Visit[];
  completed: Visit[];
};

const VisitsList: React.FC = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [filteredVisits, setFilteredVisits] = useState<FilteredVisitsType>({
    scheduled: [],
    completed: [],
  });

  const user = useAppSelector((state) => state.auth.user);
  const {
    data: visits,
    isFetching,
    isError,
    isSuccess,
  } = useGetVisitsQuery({
    employee: user?.employee_profile.id,
    date: selectedDate.format("YYYY-MM-DD"),
    project: searchText,
  });

  useEffect(() => {
    if (isSuccess) {
      console.log(visits);
      
      setFilteredVisits({
        scheduled: visits.filter((visit) => visit.status === "مجدولة"),
        completed: visits.filter((visit) => visit.status === "مكتملة"),
      });
    }
  }, [isSuccess, visits]);

  if (isFetching) return <Loading />;
  if (isError) return <ErrorPage />;
  return (
    <div className="space-y-6">
      <h1 className="mb-6 text-2xl font-bold">الزيارات</h1>

      {/* Search Bar */}
      <div className="flex justify-between flex-wrap mb-4">
        <Input.Search
          placeholder="ابحث ضمن الزيارات..."
          className="w-full max-w-md"
          allowClear={true}
          size="large"
          onSearch={(value) => {
            setSearchText(value);
          }}
          defaultValue={searchText}
          onClear={() => setSearchText("")}
        />
      </div>

      {/* Scheduled Visits */}
      <Card
        className="shadow-md"
        title={
          <div className="flex items-center gap-2 text-blue-600">
            <CalendarOutlined />
            زيارات مجدولة ليوم {selectedDate.format("DD-MM-YYYY")}
          </div>
        }
      >
        <div className="grid gap-4">
          {filteredVisits!.scheduled?.length > 0 ? (
            filteredVisits?.scheduled.map((visit) => (
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
          {filteredVisits!.completed?.length > 0 ? (
            filteredVisits?.completed.map((visit) => (
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

export default VisitsList;
