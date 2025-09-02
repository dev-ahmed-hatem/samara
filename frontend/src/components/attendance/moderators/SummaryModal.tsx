import { useState } from "react";
import { Modal, Button, Card } from "antd";
import { EyeOutlined } from "@ant-design/icons";
import VisitReport from "@/pages/visits/moderators/VisitReport";
import Loading from "@/components/Loading";
import ShiftStats from "../ShiftStats";
import { useGetShiftAttendanceQuery } from "@/app/api/endpoints/attendance";

type SummaryModalProps = {
  shift_id: number;
};

const SummaryModal = ({ shift_id }: SummaryModalProps) => {
  const [open, setOpen] = useState(false);

  const {
    data: shiftAttendance,
    isFetching: fetchingAttendance,
    isError: attendanceIsError,
  } = useGetShiftAttendanceQuery({ shift_id });

  return (
    <>
      <Button
        type="primary"
        size="middle"
        icon={<EyeOutlined />}
        onClick={() => setOpen(true)}
      >
        عرض
      </Button>

      <Modal
        title={null} // remove title if you want full page feel
        open={open}
        footer={null} // no footer buttons
        className="w-[95%] top-10"
        onCancel={() => setOpen(false)}
      >
        {attendanceIsError && (
          <Card
            title="ملخص الحضور"
            className="shadow-md text-red-600 text-base"
          >
            حدث خطأ! برجاء إعادة المحاولة
          </Card>
        )}

        {/* Report Section */}
        {fetchingAttendance ? (
          <Loading />
        ) : (
          shiftAttendance && <ShiftStats shiftAttendance={shiftAttendance} />
        )}
      </Modal>
    </>
  );
};

export default SummaryModal;
