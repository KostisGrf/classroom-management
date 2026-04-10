import { BaseRecord } from "@refinedev/core";

export interface Subject extends BaseRecord {
  id: string;
  code: string;
  name: string;
  department: string;
  description: string;
}

export const mockSubjects: Subject[] = [
  {
    id: "1",
    code: "CS101",
    name: "Introduction to Computer Science",
    department: "Computer Science",
    description: "A foundational course covering basic programming concepts, algorithms, and data structures."
  },
  {
    id: "2",
    code: "MATH201",
    name: "Calculus II",
    department: "Mathematics",
    description: "Advanced calculus topics including integration techniques, series, and multivariable calculus."
  },
  {
    id: "3",
    code: "ENG301",
    name: "Advanced English Literature",
    department: "English",
    description: "Exploration of classic and contemporary literature with emphasis on critical analysis and writing."
  }
];