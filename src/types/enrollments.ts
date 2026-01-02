export type EnrollmentStatus = "active" | "inactive";

export interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  enrolledAt: string;      // ISO-8601
  status: EnrollmentStatus;
  progress: number;        // 0..100
}

export interface LessonProgress {
  id: number;
  enrollmentId: number;
  lessonId: number;
  completed: boolean;
  completedAt: string | null; // ISO-8601 o null
}

export interface Submission {
  id: number;
  userId: number;
  quizId: number;
  attempt: number;
  score: number;
  answers: Record<string, number>;
  submittedAt: string;       // ISO-8601
}
