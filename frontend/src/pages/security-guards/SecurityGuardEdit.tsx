import { useGetSecurityGuardQuery } from "@/app/api/endpoints/security_guards";
import { useParams } from "react-router";
import Loading from "@/components/Loading";
import SecurityGuardForm from "./SecurityGuardForm";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import ErrorPage from "@/pages/ErrorPage";

const SecurityGuardEdit = () => {
  const { guard_id } = useParams();
  if (!guard_id) return <ErrorPage />;

  const {
    data: guardData,
    isFetching,
    isError,
    error: guardError,
  } = useGetSecurityGuardQuery({ id: guard_id, format: "form_data" });

  if (isFetching) return <Loading />;
  if (isError) {
    const error_title =
      (guardError as axiosBaseQueryError).status === 404
        ? "فرد الأمن غير موجود! تأكد من الكود المدخل."
        : undefined;

    return (
      <ErrorPage subtitle={error_title} reload={error_title === undefined} />
    );
  }

  return <SecurityGuardForm initialValues={guardData} security_guard_id={guard_id} />;
};

export default SecurityGuardEdit;
