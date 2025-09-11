import { useEffect, useState } from "react";
import { Modal, Button, Card, Popconfirm } from "antd";
import { DeleteOutlined, EyeOutlined } from "@ant-design/icons";
import Loading from "@/components/Loading";
import ShiftStats from "../ShiftStats";
import {
  useDeleteShiftAttendanceMutation,
  useGetShiftAttendanceQuery,
} from "@/app/api/endpoints/attendance";
import { useNotification } from "@/providers/NotificationProvider";

type SummaryModalProps = {
  shift_id: number;
};

const SummaryModal = ({ shift_id }: SummaryModalProps) => {
  const notification = useNotification();
  const [open, setOpen] = useState(false);

  const {
    data: shiftAttendance,
    isFetching: fetchingAttendance,
    isError: attendanceIsError,
  } = useGetShiftAttendanceQuery({ shift_id });
  const [deleteShift, { isLoading, isSuccess, isError }] =
    useDeleteShiftAttendanceMutation();

  const handleDelete = () => {
    deleteShift(shift_id);
  };

  useEffect(() => {
    if (isSuccess) {
      notification.success({ message: "تم حذف تسجيل الحضور" });
    }
  }, [isSuccess]);

  useEffect(() => {
    if (isError) {
      notification.error({
        message: "حدث خطأ أثناء حذف تسجيل الحضور ! برجاء إعادة المحاولة",
      });
    }
  }, [isError]);

  return (
    <>
      <div className="flex gap-2 flex-wrap">
        <Button
          type="primary"
          size="middle"
          icon={<EyeOutlined />}
          onClick={() => setOpen(true)}
          disabled={isLoading}
        >
          عرض
        </Button>
        <Popconfirm
          title="هل أنت متأكد من الحذف؟"
          okText="نعم"
          cancelText="لا"
          onConfirm={() => handleDelete()}
        >
          <Button
            type="primary"
            danger
            size="middle"
            icon={<DeleteOutlined />}
            loading={isLoading}
          >
            حذف
          </Button>
        </Popconfirm>
      </div>

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
