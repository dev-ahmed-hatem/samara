import { useState } from "react";
import { Table, Input, Tag } from "antd";
import { PlusOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router";
import { tablePaginationConfig } from "@/utils/antd";
import Loading from "@/components/Loading";
import ErrorPage from "../ErrorPage";
import { ColumnsType } from "antd/es/table";
import { PaginatedResponse } from "@/types/paginatedResponse";
import { useGetProjectsQuery } from "@/app/api/endpoints/projects";
import { Project } from "@/types/project";

const ProjectsList = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const navigate = useNavigate();

  const {
    data: rawProjects,
    isLoading,
    isFetching,
    isError,
  } = useGetProjectsQuery({
    no_pagination: false,
    search,
    page,
    page_size: pageSize,
    list_details: "true",
  });

  const projects = rawProjects as PaginatedResponse<Project> | undefined;

  const columns: ColumnsType<Project> = [
    {
      title: "#",
      key: "index",
      render: (_: any, __: any, index: number) =>
        (page ? (page - 1) * pageSize : 0) + index + 1,
    },
    {
      title: "اسم المشروع",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: Project) => (
        <div className="flex flex-col">
          <span className="font-semibold text-calypso-700">{text}</span>
          <span className="text-sm text-gray-500">
            {record.locations?.length || 0} موقع <span className="mx-1">•</span>{" "}
            {record.guards_count?.reduce(
              (total, loc) => total + (loc.count || 0),
              0
            )}{" "}
            رجل أمن
          </span>
        </div>
      ),
    },
    {
      title: "المواقع",
      dataIndex: "locations",
      key: "locations",
      render: (locations: Project["locations"]) => {
        if (!locations || locations.length === 0) return <span>-</span>;
        return (
          <div className="flex flex-col gap-2">
            {locations.map((loc, idx) => (
              <Tag
                key={idx}
                icon={<EnvironmentOutlined />}
                color="gold"
                className="w-fit text-base"
              >
                {loc.name}
              </Tag>
            ))}
          </div>
        );
      },
    },
    {
      title: "عدد رجال الأمن بالمواقع",
      key: "guards_count",
      render: (_, record: Project) => {
        if (!record.locations || record.locations.length === 0)
          return <span>-</span>;

        return (
          <div className="flex flex-col gap-2">
            {record.guards_count?.map((loc, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-white font-medium ${
                  idx % 3 === 0
                    ? "bg-green-600"
                    : idx % 3 === 1
                    ? "bg-blue-600"
                    : "bg-purple-600"
                }`}
              >
                <span className="rounded-full bg-white text-gray-800 font-bold w-6 h-6 flex items-center justify-center">
                  {idx + 1}
                </span>
                <span className="flex-1">{loc.name}</span>
                <span>{loc.count ?? 0} فرد</span>
              </div>
            ))}
          </div>
        );
      },
    },
  ];

  if (isLoading) return <Loading />;
  if (isError)
    return (
      <ErrorPage
        title="فشل تحميل البيانات"
        subtitle="حدث خطأ أثناء تحميل بيانات المشروعات."
      />
    );

  return (
    <>
      <h1 className="mb-6 text-2xl md:text-3xl font-bold">المشروعات</h1>

      <div className="flex justify-between flex-wrap mb-4 gap-6">
        <Input.Search
          placeholder="ابحث عن مشروع..."
          onSearch={(value) => setSearch(value)}
          className="w-full max-w-md h-10"
          defaultValue={search}
          allowClear
          onClear={() => setSearch("")}
        />

        <Link
          to={"add"}
          className="h-10 px-6 flex items-center text-white gap-2 rounded-lg
          bg-gradient-to-l from-green-800 to-green-600 hover:from-green-700
        hover:to-green-500 shadow-[0_2px_0_rgba(0,58,58,0.31)]
          transition-all duration-200"
        >
          <PlusOutlined />
          <span>إضافة مشروع</span>
        </Link>
      </div>

      {projects && (
        <Table
          dataSource={projects?.data}
          columns={columns}
          rowKey="id"
          loading={isFetching}
          onRow={(record) => ({
            onClick: () => navigate(`project-profile/${record.id}`),
          })}
          pagination={tablePaginationConfig({
            total: projects?.count,
            current: projects?.page,
            pageSize,
            onChange(page, pageSize) {
              setPage(page);
              setPageSize(pageSize);
            },
          })}
          bordered
          scroll={{ x: "max-content" }}
          className="clickable-table calypso-header"
        />
      )}
    </>
  );
};

export default ProjectsList;
