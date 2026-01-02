// src/mocks/enrollments.ts
export type Enrollment = {
  userId: number;
  courseId: number;
  progress: number; // 0-100
};

export const enrollmentsSeed: Enrollment[] = [
  { userId: 1, courseId: 101, progress: 35 },
  { userId: 1, courseId: 102, progress: 0 },
];
