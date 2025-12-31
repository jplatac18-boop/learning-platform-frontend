import { api } from "./api";
import type { Quiz, Question, Choice } from "../types/courses";

/**
 * Quizzes:
 * - Puede filtrar por course_id o module_id (según tu backend)
 * Endpoint: /api/courses/quizzes/
 */
export async function getQuizzes(params?: { course_id?: number; module_id?: number }) {
  const res = await api.get<Quiz[]>("courses/quizzes/", { params });
  return res.data;
}

/**
 * Questions:
 * Endpoint: /api/courses/questions/?quiz_id=123
 */
export async function getQuestions(params?: { quiz_id?: number }) {
  const res = await api.get<Question[]>("courses/questions/", { params });
  return res.data;
}

/**
 * Choices:
 * Endpoint: /api/courses/choices/?question_id=456
 */
export async function getChoices(params?: { question_id?: number }) {
  const res = await api.get<Choice[]>("courses/choices/", { params });
  return res.data;
}
