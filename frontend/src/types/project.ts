export type Project = {
  id: string;
  name: string;
  locations?: { name: string; id: string }[];
  guards_count: { name: string; count: number }[];
};
