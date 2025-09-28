import { useGetProjectQuery } from "@/app/api/endpoints/projects";
import { useParams } from "react-router";
import Loading from "@/components/Loading";
import ProjectForm from "./ProjectForm";
import { axiosBaseQueryError } from "@/app/api/axiosBaseQuery";
import ErrorPage from "@/pages/ErrorPage";

const ProjectEdit = () => {
  const { project_id } = useParams();
  if (!project_id) return <ErrorPage />;

  const {
    data: projectData,
    isFetching,
    isError,
    error: projectError,
  } = useGetProjectQuery(project_id);

  if (isFetching) return <Loading />;
  if (isError) {
    const error_title =
      (projectError as axiosBaseQueryError).status === 404
        ? "المشروع غير موجود! تأكد من الكود المدخل."
        : undefined;

    return (
      <ErrorPage subtitle={error_title} reload={error_title === undefined} />
    );
  }

  return <ProjectForm initialValues={projectData} project_id={project_id} />;
};

export default ProjectEdit;
