import { Visit } from "@/types/visit";
import { Button } from "antd";
import { useNavigate } from "react-router";

const VisitCard = ({
  visit,
  type,
}: {
  visit: Visit;
  type: "scheduled" | "completed";
}) => {
  const isCompleted = type === "completed";
  const navigate = useNavigate();

  return (
    <div
      className={`border p-4 rounded-lg shadow-sm transition hover:shadow-md ${
        isCompleted
          ? "border-green-500 bg-green-50"
          : "border-blue-500 bg-white"
      }`}
    >
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
        <div>
          <h3 className="text-lg font-semibold">
            {visit.location.project_name} - {visit.location.name}
          </h3>
          <p className="text-gray-600 text-sm truncate max-w-full">
            {visit.purpose}
          </p>
        </div>
        {!isCompleted && (
          <div className="flex gap-2 mt-2 md:mt-0">
            <Button
              type="primary"
              className="bg-blue-600 hover:bg-blue-500"
              onClick={() => navigate(`start-visit/${visit.id}`)}
            >
              بدء الزيارة
            </Button>
            <Button
              danger
              onClick={() => navigate(`report-violation/${visit.id}`)}
            >
              إبلاغ عن مخالفة
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VisitCard;
