// src/services/coursesService.ts
import type { Course, Module, Lesson } from "../types/courses";
import { storage, type DataStore } from "./storage";

const PAGE_SIZE = 6;

export async function listCourses(params?: {
  page?: number;
  search?: string;
  category?: string;
  level?: string;
  ordering?: string;
}) {
  const data = storage.readStore() as DataStore;

  let items = data.courses.slice();

  if (params?.search) {
    const q = params.search.toLowerCase();
    items = items.filter((c) =>
      c.title.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q)
    );
  }

  if (params?.category) {
    items = items.filter((c) => c.category === params.category);
  }

  if (params?.level) {
    items = items.filter((c) => c.level === params.level);
  }

  if (params?.ordering) {
    const ord = params.ordering;
    const desc = ord.startsWith("-");
    const field = desc ? ord.slice(1) : ord;

    items.sort((a: any, b: any) => {
      const av = a[field];
      const bv = b[field];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (av < bv) return desc ? 1 : -1;
      if (av > bv) return desc ? -1 : 1;
      return 0;
    });
  }

  const page = params?.page && params.page > 0 ? params.page : 1;
  const start = (page - 1) * PAGE_SIZE;
  const paginated = items.slice(start, start + PAGE_SIZE);

  const totalPages = Math.max(1, Math.ceil(items.length / PAGE_SIZE));
  const hasNext = page < totalPages;
  const hasPrev = page > 1;

  return {
    items: paginated,
    count: items.length,
    next: hasNext ? String(page + 1) : null,
    previous: hasPrev ? String(page - 1) : null,
  };
}

export async function getCourseDetail(courseId: number): Promise<Course> {
  const data = storage.readStore() as DataStore;
  const course = data.courses.find((c) => c.id === courseId);
  if (!course) throw new Error("Course not found");
  return course;
}

export async function studentListModules(courseId: number): Promise<Module[]> {
  const data = storage.readStore() as DataStore;
  return data.modules.filter((m) => m.courseId === courseId);
}

export async function studentListLessons(
  courseId: number,
  moduleId?: number
): Promise<Lesson[]> {
  const data = storage.readStore() as DataStore;

  let lessons = data.lessons.filter((l) => {
    const mod = data.modules.find((m) => m.id === l.moduleId);
    return mod && mod.courseId === courseId;
  });

  if (moduleId) {
    lessons = lessons.filter((l) => l.moduleId === moduleId);
  }

  return lessons;
}
