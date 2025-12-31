import { api } from "./api";
import type { Enrollment, LessonProgress } from "../types/enrollments";

export async function enroll(course_id: number) {
  const res = await api.post<Enrollment>("enrollments/enrollments/enroll/", { course_id });
  return res.data;
}

export async function myEnrollments() {
  const res = await api.get<Enrollment[]>("enrollments/enrollments/my/");
  return res.data;
}

export async function markLessonCompleted(lesson_id: number) {
  const res = await api.post<LessonProgress>("enrollments/lesson-progress/complete/", { lesson_id });
  return res.data;
}

// NUEVO: progreso de lecciones por curso para el usuario actual
export async function lessonProgressByCourse(course_id: number) {
  const res = await api.get<LessonProgress[]>("enrollments/lesson-progress/", {
    params: { course_id },
  });
  return res.data;
}
