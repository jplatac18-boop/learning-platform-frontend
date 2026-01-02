// src/types/courses.ts

// Estado del curso
export type CourseStatus = "draft" | "published";

// Nivel del curso
export type CourseLevel = "basico" | "intermedio" | "avanzado";

// Curso
export interface Course {
  id: number;
  title: string;
  description: string;
  category: string;

  level: CourseLevel;  // antes: string

  duration: number;
  imageUrl: string;      // antes: imagen
  status: CourseStatus;  // antes: CourseEstado

  createdAt: string;     // ISO-8601
  updatedAt: string;     // ISO-8601

  instructor?:
    | number
    | {
        id: number;
        userId?: number;
        username?: string;
      };
}

// Módulo
export interface Module {
  id: number;
  courseId: number;
  title: string;
  order: number;
}

// Tipo de lección
export type LessonType = "video" | "text" | "file";

// Lección
export interface Lesson {
  id: number;
  moduleId: number;
  title: string;
  type: LessonType;

  content: string;
  videoUrl: string;
  fileUrl: string | null;

  order: number;
}

// Quiz
export interface Quiz {
  id: number;
  courseId: number | null;
  moduleId: number | null;
  title: string;
  description: string;
}

// Pregunta
export interface Question {
  id: number;
  quizId: number;
  text: string;
  order: number;
}

// Opción
export interface Choice {
  id: number;
  questionId: number;
  text: string;
  isCorrect: boolean;
}
