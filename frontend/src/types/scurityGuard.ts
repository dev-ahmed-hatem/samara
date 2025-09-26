import { ShiftType } from "./attendance";
import { Location } from "./location";

export type SecurityGuard = {
  id: string;
  name: string;
  location: Location;
  shift: ShiftType;
  is_active: boolean;
  location_shifts?: {
    location: string;
    shift: string;
  }[];
};
