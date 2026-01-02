// src/services/courseStructure.ts
import type { Lesson, Module } from "../types/courses";
import { storage, type DataStore } from "./storage";
import { myEnrollments } from "./enrollmentService";

async function ensureEnrolled(courseId?: number) {
  if (!courseId) return;
  const enrollments = await myEnrollments();
  const has = enrollments.some(
    (e) => e.courseId === courseId && e.status === "active"
  );
  if (!has) throw new Error("no_enrollment");
}

export async function getModules(params?: {
  courseId?: number;
}): Promise<Module[]> {
  const data = storage.readStore() as DataStore;
  if (params?.courseId) {
    await ensureEnrolled(params.courseId);
    return data.modules.filter((m) => m.courseId === params.courseId);
  }
  return data.modules;
}

export async function getLessons(params?: {
  courseId?: number;
  moduleId?: number;
}): Promise<Lesson[]> {
  const data = storage.readStore() as DataStore;

  if (params?.courseId) {
    await ensureEnrolled(params.courseId);
    const moduleIds = data.modules
      .filter((m) => m.courseId === params.courseId)
      .map((m) => m.id);

    let lessons = data.lessons.filter((l) => moduleIds.includes(l.moduleId));
    if (params.moduleId) {
      lessons = lessons.filter((l) => l.moduleId === params.moduleId);
    }
    return lessons;
  }

  if (params?.moduleId) {
    return data.lessons.filter((l) => l.moduleId === params.moduleId);
  }

  return data.lessons;
}
