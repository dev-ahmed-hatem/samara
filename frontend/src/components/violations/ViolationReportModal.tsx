import { useState } from "react";
import { Modal, Button } from "antd";
import ViolationReport from "@/pages/violations/moderators/ViolationReport";

type ViolationReportModalProps = {
  report_id: string;
  disabled: boolean;
};

const ViolationReportModal = ({
  report_id,
  disabled,
}: ViolationReportModalProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="primary"
        size="middle"
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        عرض التفاصيل
      </Button>

      <Modal
        title={null}
        open={open}
        footer={null}
        className="w-[95%] top-10"
        onCancel={() => setOpen(false)}
      >
        <ViolationReport report_id={report_id} />
      </Modal>
    </>
  );
};

export default ViolationReportModal;
