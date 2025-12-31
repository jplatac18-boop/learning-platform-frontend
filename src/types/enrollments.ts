export type EnrollmentEstado = "activo" | "inactivo";

export interface Enrollment {
  id: number;
  user: number;
  course: number;
  fecha: string;      // ISO-8601 [web:1204]
  estado: EnrollmentEstado;
  progreso: number;   // 0..100
}

export interface LessonProgress {
  id: number;
  enrollment: number;
  lesson: number;
  completado: boolean;
  completed_at: string | null; // ISO-8601 o null [web:1204]
}

export interface Submission {
  id: number;
  user: number;
  quiz: number;
  attempt: number;
  score: number;
  answers: Record<string, number>;
  fecha: string; // ISO-8601 [web:1204]
}
