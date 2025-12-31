import { api } from "./api";
import type { Course } from "../types/courses";
import type { Module, Lesson } from "../types/courses";

export type Paginated<T> = {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
};

function isPaginated<T>(x: any): x is Paginated<T> {
  return x && typeof x === "object" && Array.isArray(x.results) && typeof x.count === "number";
}

export async function listCourses(params?: {
  page?: number;
  search?: string;
  categoria?: string;
  nivel?: string;
  ordering?: string;
}) {
  const res = await api.get<Course[] | Paginated<Course>>("courses/courses/", { params });
  const data = res.data;

  if (isPaginated<Course>(data)) {
    return { items: data.results, count: data.count, next: data.next, previous: data.previous };
  }
  return { items: data, count: data.length, next: null, previous: null };
}

export async function getCourseDetail(courseId: number) {
  const res = await api.get<Course>(`courses/courses/${courseId}/`);
  return res.data;
}

// Módulos visibles para estudiantes en un curso
export async function studentListModules(courseId: number) {
  const res = await api.get<Module[]>("courses/student-modules/", {
    params: { course_id: courseId },
  });
  return res.data;
}

// Lecciones visibles para estudiantes en un curso
export async function studentListLessons(courseId: number, moduleId?: number) {
  const res = await api.get<Lesson[]>("courses/student-lessons/", {
    params: { course_id: courseId, ...(moduleId ? { module_id: moduleId } : {}) },
  });
  return res.data;
}