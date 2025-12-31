import { api } from "./api";
import type { Lesson, Module } from "../types/courses";

export async function getModules(params?: { course_id?: number }) {
  try {
    const res = await api.get<Module[]>("courses/student-modules/", { params });
    return res.data;
  } catch (err: any) {
    if (err?.response?.status === 403) {
      throw new Error("no_enrollment");
    }
    throw err;
  }
}

export async function getLessons(params?: { course_id?: number; module_id?: number }) {
  try {
    const res = await api.get<Lesson[]>("courses/student-lessons/", { params });
    return res.data;
  } catch (err: any) {
    if (err?.response?.status === 403) {
      throw new Error("no_enrollment");
    }
    throw err;
  }
}
