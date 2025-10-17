import { Collapse } from "antd";
import AttendanceStatusGrid from "./AttendanceStatusGrid";
import {
  CheckSquareOutlined,
  DownOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { useState } from "react";

const { Panel } = Collapse;

const AttendanceAccordion = ({ attendances }: { attendances: any }) => {
  const [activeKey, setActiveKey] = useState<string | string[]>([]);

  return (
    <Collapse
      activeKey={activeKey}
      onChange={(key) => setActiveKey(key)}
      expandIconPosition="end"
      expandIcon={({ isActive }) =>
        isActive ? (
          <UpOutlined className="text-[#b79237]" />
        ) : (
          <DownOutlined className="text-[#b79237]" />
        )
      }
      className="w-full bg-white rounded-lg border border-gray-200 shadow-md"
    >
      <Panel
        key="1"
        header={
          <div className="flex items-center gap-2 text-gray-800 font-semibold">
            <CheckSquareOutlined className="text-[#b79237]" />
            <span>حالة الحضور للمواقع</span>
          </div>
        }
        
      >
        <div className="p-3">
          <AttendanceStatusGrid attendances={attendances.attendances} />
        </div>
      </Panel>
    </Collapse>
  );
};

export default AttendanceAccordion;
