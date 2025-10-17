import { Card, Tooltip } from "antd";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
} from "@ant-design/icons";

const AttendanceStatusGrid = ({ attendances }: { attendances: any }) => {
  return (
    <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
      {attendances.map((loc: any, idx: number) => (
        <div
          key={idx}
          className="group relative rounded-3xl bg-white shadow-md hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300"
        >
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,#b79237_0%,transparent_70%)] opacity-10 pointer-events-none" />

          {/* Header */}
          <div className="p-5 pb-3 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-bold text-lg text-gray-800">{loc.location}</h3>
            <span className="text-xs text-gray-500">الموقع</span>
          </div>

          {/* Shifts - horizontal layout */}
          <div className="p-5 flex flex-col gap-3">
            <div className="flex justify-between gap-3">
              {Object.entries(loc.shifts).map(([shiftName, shiftData]: any, i) => {
                const attended = shiftData.has_attendance;
                return (
                  <Tooltip
                    key={i}
                    title={
                      attended ? "تم تسجيل الحضور" : "لم يتم تسجيل الحضور"
                    }
                  >
                    <div
                      className={`flex flex-col items-center justify-center flex-1 p-3 rounded-2xl shadow-sm transition-all duration-300 cursor-default
                        ${
                          attended
                            ? "bg-gradient-to-br from-green-400 to-emerald-500 text-white"
                            : "bg-gradient-to-br from-gray-200 to-gray-300 text-gray-600"
                        }`}
                    >
                      {attended ? (
                        <CheckCircleOutlined className="text-2xl mb-1" />
                      ) : (
                        <CloseCircleOutlined className="text-2xl mb-1" />
                      )}
                      <span className="text-xs font-medium">{shiftName}</span>
                    </div>
                  </Tooltip>
                );
              })}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AttendanceStatusGrid;
