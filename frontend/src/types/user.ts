export type ENGLISH_ROLES = "admin" | "sys_user" | "supervisor";
export type ARABBIC_ROLES = "مدير" | "مستخدم نظام" | "مشرف";

export type User = {
  name: string;
  username: string;
  phone: string;
  national_id: string;
  is_active: boolean;
  is_moderator: boolean;
  is_superuser: boolean;
  is_root: boolean;
  role_arabic: ARABBIC_ROLES;
  role: ENGLISH_ROLES;
};
