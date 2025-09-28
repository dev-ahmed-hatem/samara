import { ShiftType } from "./attendance";

export type Project = {
  id: string;
  name: string;
  locations?: { name: string; id: string }[];
  guards_count?: { name: string; count: number }[];
  locations_count: number;
  guards_total?: number;
};
