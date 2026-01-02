// src/services/coursesContentServices.ts
import type { Quiz, Question, Choice } from "../types/courses";
import { storage } from "./storage";

/**
 * Quizzes:
 * - Puede filtrar por courseId o moduleId
 */
export async function getQuizzes(params?: {
  courseId?: number;
  moduleId?: number;
}): Promise<Quiz[]> {
  const data = storage.readStore();
  let quizzes = data.quizzes;

  if (params?.courseId) {
    const moduleIds = data.modules
      .filter((m) => m.courseId === params.courseId)
      .map((m) => m.id);

    quizzes = quizzes.filter(
      (q) =>
        q.courseId === params.courseId ||
        (q.moduleId != null && moduleIds.includes(q.moduleId))
    );
  }

  if (params?.moduleId) {
    quizzes = quizzes.filter((q) => q.moduleId === params.moduleId);
  }

  return quizzes;
}

/**
 * Questions por quiz.
 */
export async function getQuestions(params?: {
  quizId?: number;
}): Promise<Question[]> {
  const data = storage.readStore();

  if (params?.quizId) {
    return data.questions.filter((q) => q.quizId === params.quizId);
  }

  return data.questions;
}

/**
 * Choices por pregunta.
 */
export async function getChoices(params?: {
  questionId?: number;
}): Promise<Choice[]> {
  const data = storage.readStore();

  if (params?.questionId) {
    return data.choices.filter((c) => c.questionId === params.questionId);
  }

  return data.choices;
}
