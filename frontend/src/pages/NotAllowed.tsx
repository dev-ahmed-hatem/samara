import { Button } from "antd";

const NotAllowed = () => {
  return (
    <div className="flex-grow flex flex-col items-center justify-center text-center p-8 min-h-96">
      <h1 className="text-4xl font-bold text-red-600 mb-4">
        غير مصرح لك بالوصول
      </h1>
      <p className="text-lg text-gray-700 mb-4">
        عذرًا، ليس لديك الصلاحيات اللازمة للوصول إلى هذه الصفحة. يرجى العودة إلى
        الصفحة الرئيسية أو التواصل مع المسؤول إذا كنت تعتقد أن هذا خطأ.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <Button
          type="primary"
          htmlType="button"
          size="large"
          onClick={() => {
            window.location.href = "/";
          }}
        >
          العودة للرئيسية
        </Button>
      </div>
    </div>
  );
};

export default NotAllowed;
