// src/services/enrollmentService.ts
import type { Enrollment, LessonProgress } from "../types/enrollments";
import { storage, type DataStore } from "./storage";
import { getSession } from "./session"; // el que ya tienes

function currentUserId(): number {
  const session = getSession();
  return session?.user.id ?? 1; // demo
}

export async function enroll(courseId: number): Promise<Enrollment> {
  const data = storage.readStore() as DataStore;

  const userId = currentUserId();

  const existing = data.enrollments.find(
    (e) =>
      e.courseId === courseId &&
      e.userId === userId &&
      e.status === "active"
  );
  if (existing) return existing;

  const id = storage.nextId(data.enrollments);
  const now = new Date().toISOString();

  const enrollment: Enrollment = {
    id,
    userId,
    courseId,
    enrolledAt: now,
    status: "active",
    progress: 0,
  };

  data.enrollments.push(enrollment);
  storage.writeStore(data);
  return enrollment;
}

export async function myEnrollments(): Promise<Enrollment[]> {
  const data = storage.readStore() as DataStore;
  const userId = currentUserId();
  return data.enrollments.filter((e) => e.userId === userId);
}

export async function markLessonCompleted(
  lessonId: number
): Promise<LessonProgress> {
  const data = storage.readStore() as DataStore;
  const userId = currentUserId();

  const lesson = data.lessons.find((l) => l.id === lessonId);
  if (!lesson) throw new Error("Lesson not found");

  const module = data.modules.find((m) => m.id === lesson.moduleId);
  if (!module) throw new Error("Module not found for lesson");
  const courseId = module.courseId;

  const enrollment = data.enrollments.find(
    (e) =>
      e.courseId === courseId &&
      e.userId === userId &&
      e.status === "active"
  );
  if (!enrollment) throw new Error("Enrollment not found");

  let lp = data.lessonProgress.find(
    (p) => p.lessonId === lessonId && p.enrollmentId === enrollment.id
  );
  const now = new Date().toISOString();

  if (!lp) {
    const id = storage.nextId(data.lessonProgress);
    lp = {
      id,
      enrollmentId: enrollment.id,
      lessonId,
      completed: true,
      completedAt: now,
    };
    data.lessonProgress.push(lp);
  } else {
    lp.completed = true;
    lp.completedAt = now;
  }

  const lessonsInCourseIds = data.lessons
    .filter((l) => {
      const m = data.modules.find((mm) => mm.id === l.moduleId);
      return m && m.courseId === courseId;
    })
    .map((l) => l.id);

  const completedCount = data.lessonProgress.filter(
    (p) =>
      p.enrollmentId === enrollment.id &&
      p.completed &&
      lessonsInCourseIds.includes(p.lessonId)
  ).length;

  const total = lessonsInCourseIds.length || 1;
  const progressPercent = Math.round((completedCount / total) * 100);

  enrollment.progress = progressPercent;

  storage.writeStore(data);
  return lp;
}

export async function lessonProgressByCourse(
  courseId: number
): Promise<LessonProgress[]> {
  const data = storage.readStore() as DataStore;
  const userId = currentUserId();

  const enrollment = data.enrollments.find(
    (e) =>
      e.courseId === courseId &&
      e.userId === userId &&
      e.status === "active"
  );
  if (!enrollment) return [];

  return data.lessonProgress.filter((p) => p.enrollmentId === enrollment.id);
}
