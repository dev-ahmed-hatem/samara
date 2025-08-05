const Footer = () => {
  return (
    <footer className="bg-black text-white py-6 padding-container mt-10">
      <div
        className="max-w-7xl mx-auto flex flex-wrap
      justify-between items-center gap-4"
      >
        {/* Logo */}
        <a href="https://kaffo.co">
          {/* <Logo className="fill-orange hover:fill-orange-200 size-40" /> */}

          <img
            src="/samara.jpg"
            alt="samara logo"
            className="rounded-lg h-36"
          />
        </a>

        {/* Company Info */}
        <div>
          <h2 className="text-xl font-semibold">نظام إدارة رجال الأمن</h2>
          <p className="text-sm text-gray-400 mt-2"></p>
        </div>
      </div>

      {/* Copyright */}
      <div className="text-center text-gray-400 text-sm mt-12 border-t border-gray-700 pt-4">
        &copy; {new Date().getFullYear()} جميع الحقوق محفوظة
      </div>
    </footer>
  );
};

export default Footer;
