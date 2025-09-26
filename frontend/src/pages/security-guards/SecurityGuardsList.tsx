import { useState } from "react";
import { Table, Input, Avatar, Space, Radio, Tag } from "antd";
import {
  PlusOutlined,
  UserOutlined,
  EnvironmentOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router";
import { tablePaginationConfig } from "../../utils/antd";
import Loading from "@/components/Loading";
import { ColumnsType } from "antd/es/table";
import { PaginatedResponse } from "@/types/paginatedResponse";
import { useGetSecurityGuardsQuery } from "@/app/api/endpoints/security_guards";
import { SortOrder } from "antd/lib/table/interface";
import ErrorPage from "../ErrorPage";
import { SecurityGuard } from "@/types/scurityGuard";

type ControlsType = {
  sort_by?: string;
  order?: SortOrder;
  filters: {
    is_active?: string;
    name?: string;
  };
} | null;

const SecurityGuardsList = () => {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [controls, setControls] = useState<ControlsType>({
    filters: { is_active: "active" },
  });
  const [searchType, setSearchType] = useState<
    "name__icontains" | "employee_id"
  >("name__icontains");
  const navigate = useNavigate();

  const {
    data: rawGuards,
    isLoading,
    isFetching,
    isError,
  } = useGetSecurityGuardsQuery({
    no_pagination: false,
    search,
    search_type: searchType,
    page,
    page_size: pageSize,
    sort_by: controls?.sort_by,
    order: controls?.order === "descend" ? "-" : "",
    is_active: controls?.filters.is_active,
  });
  const guards = rawGuards as PaginatedResponse<SecurityGuard> | undefined;

  const columns: ColumnsType<SecurityGuard> = [
    {
      title: "#",
      key: "index",
      render: (_: any, __: any, index: number) =>
        (page ? (page - 1) * pageSize : 0) + index + 1,
    },
    {
      title: "الرقم الوظيفي",
      dataIndex: "employee_id",
      key: "employee_id",
      sorter: true,
      sortOrder:
        controls?.sort_by === "employee_id" ? controls?.order ?? null : null,
    },
    {
      title: "الاسم",
      dataIndex: "name",
      key: "name",
      render: (text: string, record: SecurityGuard) => (
        <Space>
          <span
            className={`mx-2 rounded-full ${
              record.is_active ? "bg-green-400" : "bg-yellow-400"
            } size-2 inline-block`}
          ></span>
          <Avatar
            className="bg-gradient-to-bl from-calypso-600 to-calypso text-white font-semibold"
            icon={<UserOutlined />}
          />
          <span className="flex flex-col">
            <div
              className={`name text-base ${
                record.is_active ? "font-bold" : "text-gray-500"
              }`}
            >
              {text}
            </div>
          </span>
        </Space>
      ),
      sorter: true,
      sortOrder: controls?.sort_by === "name" ? controls?.order ?? null : null,
    },
    {
      title: "الحالة",
      dataIndex: "is_active",
      key: "is_active",
      render: (is_active: boolean) =>
        is_active ? (
          <Tag color="green">نشط</Tag>
        ) : (
          <Tag color="volcano">غير نشط</Tag>
        ),
      filters: [
        { text: "نشط", value: "active" },
        { text: "غير نشط", value: "inactive" },
      ],
      defaultFilteredValue: controls?.filters?.is_active?.split(","),
    },
    {
      title: "المواقع / الورديات",
      dataIndex: "location_shifts",
      key: "location_shifts",
      render: (shifts: SecurityGuard["location_shifts"]) => {
        if (!shifts || shifts.length === 0) return <span>-</span>;
        return (
          <div className="flex flex-col flex-wrap gap-2">
            {shifts.map((s, idx) => (
              <Tag key={idx} color="blue" className="w-fit">
                <EnvironmentOutlined /> {s.location}{" "}
                <ClockCircleOutlined className="mr-1" /> {s.shift}
              </Tag>
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
        subtitle="حدث خطأ أثناء تحميل بيانات رجال الأمن."
      />
    );

  return (
    <>
      <h1 className="mb-6 text-2xl md:text-3xl font-bold">رجال الأمن</h1>

      <div className="flex justify-between flex-wrap mb-4 gap-6">
        <div className="flex flex-col w-full max-w-md">
          {/* Search Input */}
          <Input.Search
            placeholder="ابحث عن فرد..."
            onSearch={(value) => setSearch(value)}
            className="mb-4 w-full max-w-md h-10"
            defaultValue={search}
            allowClear={true}
            onClear={() => setSearch("")}
          />

          {/* Radio Group for Search Type */}
          <div className="flex flex-wrap gap-3 items-center">
            <span>بحث ب:</span>
            <Radio.Group
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="mt-2 flex"
              defaultValue={"name__icontains"}
            >
              <Radio.Button value="name__icontains">الاسم</Radio.Button>
              <Radio.Button value="employee_id">الرقم الوظيفي</Radio.Button>
            </Radio.Group>
          </div>
        </div>

        {/* Add Button */}
        <Link
          to={"/security-guards/add"}
          className="h-10 px-6 flex items-center text-white gap-2 rounded-lg
          bg-gradient-to-l from-green-800 to-green-600 hover:from-green-700
        hover:to-green-500 shadow-[0_2px_0_rgba(0,58,58,0.31)]
          transition-all duration-200"
        >
          <PlusOutlined />
          <span>إضافة رجل أمن</span>
        </Link>
      </div>

      {isFetching && <Loading />}

      {/* Table */}
      {!isFetching && guards && (
        <Table
          dataSource={guards?.data}
          columns={columns}
          onRow={(record) => ({
            onClick: () => navigate(`security-guard-profile/${record.id}`),
          })}
          rowKey="id"
          pagination={tablePaginationConfig({
            total: guards?.count,
            current: guards?.page,
            showQuickJumper: true,
            pageSize,
            onChange(page, pageSize) {
              setPage(page);
              setPageSize(pageSize);
            },
          })}
          onChange={(_, filters, sorter: any) => {
            setControls({
              ...(sorter.column?.key && { sort_by: sorter.column.key }),
              ...(sorter.order && { order: sorter.order }),
              filters: Object.fromEntries(
                Object.entries(filters).map(([filter, values]) => [
                  filter,
                  (values as string[])?.join(),
                ])
              ),
            });
          }}
          bordered
          scroll={{ x: "max-content" }}
          className="clickable-table calypso-header"
        />
      )}
    </>
  );
};

export default SecurityGuardsList;
