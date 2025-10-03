import { User } from "./user";

export type Employee = {
  id: string;
  url: string;
  joined_at: string;
  name: string;
  email: string;
  phone: string;
  employee_id: string;
  birthdate: string;
  position: string;
  image?: string;
  created_by: User;
  user?: User;
};

export interface AssignedEmployee {
  id: number | string;
  name: string;
  is_active: boolean;
  [key: string]: any;
}
