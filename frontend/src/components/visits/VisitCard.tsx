import { Visit } from "@/types/visit";
import { dayjs } from "@/utils/locale";
import { Button, Tag } from "antd";
import { useNavigate } from "react-router";

const VisitCard = ({
  visit,
  type,
}: {
  visit: Visit;
  type: "scheduled" | "completed";
}) => {
  const isCompleted = type === "completed";
  const isVisitDay = dayjs().isSame(dayjs(visit.date, "DD/MM/YYYY"), "day");

  const navigate = useNavigate();

  return (
    <div
      className={`border p-4 rounded-lg shadow-sm transition hover:shadow-md ${
        isCompleted
          ? "border-green-500 bg-green-50"
          : "border-blue-500 bg-white"
      }`}
    >
      <Tag color="blue" className="text-sm px-3 py-1 rounded-md mb-2">
        تاريخ الزيارة: {dayjs(visit.date, "DD/MM/YYYY").format("YYYY-MM-DD")}
      </Tag>
      <Tag color="gold" className="text-sm px-3 py-1 rounded-md mb-4">
        وقت الزيارة: {visit.time}
      </Tag>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 flex-wrap ">
        <div>
          <h3 className="text-lg font-semibold">
            {visit.location.project_name} - {visit.location.name}
          </h3>
          <p className="text-gray-600 text-sm truncate max-w-64 md:max-w-lg">
            {visit.purpose}
          </p>
          {isCompleted && (
            <Tag color="green" className="text-sm my-2">
              تمت الزيارة في: {visit.completed_at}
            </Tag>
          )}
          {visit.violation && (
            <Tag color="red" className="text-sm my-2">
              تم تسجيل مخالفة: {visit.violation}
            </Tag>
          )}
        </div>

        {/* buttons */}
        {!isCompleted && isVisitDay && (
          <div className="flex gap-2 mt-2 md:mt-0 flex-wrap">
            <Button
              type="primary"
              className="bg-blue-600 hover:bg-blue-500"
              onClick={() => navigate(`start-visit/${visit.id}`)}
            >
              بدء الزيارة
            </Button>

            {visit.violation ? (
              <Tag color="red" className="flex items-center">
                تم تسجيل مخالفة
              </Tag>
            ) : (
              <Button
                danger
                onClick={() => navigate(`report-violation/${visit.id}`)}
              >
                إبلاغ عن مخالفة
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitCard;
