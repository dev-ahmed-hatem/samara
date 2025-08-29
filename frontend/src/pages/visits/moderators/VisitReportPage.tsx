import { useParams } from "react-router";
import VisitReport from "./VisitReport";

const VisitReportPage = () => {
  const { report_id } = useParams();
  return <VisitReport report_id={report_id!} />;
};

export default VisitReportPage;
