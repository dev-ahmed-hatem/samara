import { useState } from "react";
import { Modal, Button } from "antd";
import VisitReport from "./VisitReport";

type VisitReportModalProps = {
  report_id: string;
  disabled: boolean;
};

const VisitReportModal = ({ report_id, disabled }: VisitReportModalProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="primary"
        size="middle"
        onClick={() => setOpen(true)}
        disabled={disabled}
      >
        عرض التقرير
      </Button>

      <Modal
        title={null} // remove title if you want full page feel
        open={open}
        footer={null} // no footer buttons
        className="w-[95%] top-10"
        onCancel={() => setOpen(false)}
      >
        <VisitReport report_id={report_id} />
      </Modal>
    </>
  );
};

export default VisitReportModal;
