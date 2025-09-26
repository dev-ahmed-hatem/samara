import { Form, Input, Button } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useLoginMutation, useVerifyMutation } from "@/app/api/endpoints/auth";
import { useSearchParams } from "react-router";
import { useEffect, useState } from "react";
import Loading from "@/components/Loading";
import { storeTokens } from "@/utils/storage";

const LoginPage = () => {
  const [params] = useSearchParams();

  // login flags
  const [
    login,
    {
      data: tokens,
      isLoading: logging,
      isSuccess: logged,
      isError: wrongCredentials,
    },
  ] = useLoginMutation();

  // verify flags
  const [verify, { isLoading: verifying, isSuccess: verified }] =
    useVerifyMutation();

  const [message, setMessage] = useState<string | null>(null);
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    setMessage(null);
    login({ username: values.username, password: values.password });
  };

  useEffect(() => {
    // initial verify
    const token = localStorage.getItem("access");
    if (token) verify({ token });
  }, []);

  useEffect(() => {
    if (wrongCredentials) {
      setMessage("بيانات تسجيل خاطئة");
      form.resetFields();
    }
  }, [wrongCredentials]);

  useEffect(() => {
    const next = params.get("next");
    const path = next && next !== "/login" ? next : "/";

    // store tokens
    if (logged) storeTokens(tokens);
    if (logged || verified) window.location.href = path;
  }, [logged, verified]);

  if (verifying || logged || verified) return <Loading />;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f2f1ed] via-[#ecebe7] to-[#e6e5e1] p-4">
      <div className="bg-white shadow-2xl rounded-2xl overflow-hidden flex flex-col md:flex-row w-full max-w-md md:max-w-4xl">
        {/* Left: Logo */}
        <div className="md:w-1/2 max-md:h-52 bg-gradient-to-br from-calypso-700 to-calypso-800 flex items-center justify-center">
          <img
            src="/samara.jpg"
            alt="samara logo"
            className="h-36 md:h-64 object-contain opacity-95 rounded-lg shadow-lg"
          />
        </div>

        {/* Right: Form */}
        <div className="md:w-1/2 w-full p-8 sm:p-12 flex flex-col justify-center text-right bg-gradient-to-tl from-white to-[#fdfcf9]">
          <h2 className="text-3xl font-extrabold text-[#b79237] mb-6 text-center">
            تسجيل دخول
          </h2>

          <Form
            layout="vertical"
            onFinish={onFinish}
            form={form}
            className="rtl text-right"
          >
            <Form.Item
              label="اسم المستخدم"
              name="username"
              rules={[{ required: true, message: "يرجى إدخال اسم المستخدم" }]}
            >
              <Input
                size="large"
                placeholder="اسم المستخدم"
                prefix={<UserOutlined className="text-[#b79237]" />}
                className="rounded-lg"
                autoFocus
              />
            </Form.Item>

            <Form.Item
              label="كلمة المرور"
              name="password"
              rules={[{ required: true, message: "يرجى إدخال كلمة المرور" }]}
            >
              <Input.Password
                size="large"
                placeholder="كلمة المرور"
                prefix={<LockOutlined className="text-[#b79237]" />}
                className="rounded-lg"
              />
            </Form.Item>

            {message && (
              <div className="text-center text-base text-red-600 font-semibold mt-2">
                {message}
              </div>
            )}

            <Form.Item className="text-center mt-6">
              <Button
                type="primary"
                htmlType="submit"
                size="large"
                className="w-full bg-[#b79237] border-[#b79237] hover:bg-[#a98530] hover:border-[#a98530] rounded-lg shadow-md"
                loading={logging}
              >
                دخول
              </Button>
            </Form.Item>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
