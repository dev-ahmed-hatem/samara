import { useParams } from "react-router";
import Loading from "@/components/Loading";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import ErrorPage from "@/pages/ErrorPage";
import { useGetVisitFormDataQuery } from "@/app/api/endpoints/visits";
import CreateVisitForm from "./CreateVisitForm";

const EditVisit = () => {
  const { visit_id } = useParams();
  if (!visit_id) return <ErrorPage />;

  const {
    data: visitData,
    isFetching,
    isError,
    error: guardError,
  } = useGetVisitFormDataQuery(visit_id);

  if (isFetching) return <Loading />;
  if (isError) {
    const error_title =
      (guardError as axiosBaseQueryError).status === 404
        ? "زيارة غير موجودة! تأكد من الكود المدخل."
        : undefined;

    return (
      <ErrorPage subtitle={error_title} reload={error_title === undefined} />
    );
  }

  return <CreateVisitForm visitData={visitData} />;
};

export default EditVisit;
