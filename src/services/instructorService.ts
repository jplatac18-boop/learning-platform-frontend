// src/services/instructorService.ts
import { api } from "./api";
import type { Course, Module, Lesson } from "../types/courses";

// ------- Cursos -------
export async function instructorListCourses() {
  const res = await api.get<Course[]>("courses/courses/", {
    params: { my: "instructor" }, // si tienes filtro, ajusta; si no, quítalo
  });
  return res.data;
}

export async function instructorCreateCourse(payload: {
  titulo: string;
  descripcion: string;
  categoria: string;
  nivel: string;
  duracion: number;
  estado: string;
}) {
  const res = await api.post<Course>("courses/courses/", payload);
  return res.data;
}

export async function instructorUpdateCourse(
  id: number,
  payload: Partial<{
    titulo: string;
    descripcion: string;
    categoria: string;
    nivel: string;
    duracion: number;
    estado: string;
  }>
) {
  const res = await api.patch<Course>(`courses/courses/${id}/`, payload);
  return res.data;
}

export async function instructorDeleteCourse(id: number) {
  await api.delete(`courses/courses/${id}/`);
}

// ------- Módulos -------
export async function instructorListModules(params: { course_id: number }) {
  const res = await api.get<Module[]>("courses/modules/", { params });
  return res.data;
}

export async function instructorCreateModule(payload: {
  course: number;
  titulo: string;
  orden?: number;
}) {
  const res = await api.post<Module>("courses/modules/", payload);
  return res.data;
}

export async function instructorUpdateModule(
  id: number,
  payload: Partial<{ titulo: string; orden: number }>
) {
  const res = await api.patch<Module>(`courses/modules/${id}/`, payload);
  return res.data;
}

export async function instructorDeleteModule(id: number) {
  await api.delete(`courses/modules/${id}/`);
}

// ------- Lecciones -------
type LessonCreatePayload = {
  module: number;
  titulo: string;
  tipo: "video" | "texto" | "archivo";
  orden?: number;
  contenido?: string;
  url_video?: string;
  archivo?: File;
};

type LessonUpdatePayload = Partial<{
  titulo: string;
  orden: number;
  contenido: string;
  url_video: string;
  archivo: File;
}>;

// helper para construir FormData
function buildLessonFormData(data: LessonCreatePayload | LessonUpdatePayload) {
  const fd = new FormData();
  if ("module" in data && data.module != null) {
    fd.append("module", String(data.module));
  }
  if (data.titulo !== undefined) fd.append("titulo", data.titulo);
  if ("tipo" in data && data.tipo !== undefined) fd.append("tipo", data.tipo as string);
  if (data.orden !== undefined) fd.append("orden", String(data.orden));
  if (data.contenido !== undefined) fd.append("contenido", data.contenido);
  if (data.url_video !== undefined) fd.append("url_video", data.url_video);
  if ((data as any).archivo instanceof File) fd.append("archivo", (data as any).archivo);
  return fd;
}

export async function instructorListLessons(params: { course_id?: number; module_id?: number }) {
  const res = await api.get<Lesson[]>("courses/lessons/", { params });
  return res.data;
}

export async function instructorCreateLesson(payload: LessonCreatePayload) {
  const formData = buildLessonFormData(payload);
  const res = await api.post<Lesson>("courses/lessons/", formData);
  return res.data;
}

export async function instructorUpdateLesson(id: number, payload: LessonUpdatePayload) {
  const formData = buildLessonFormData(payload);
  const res = await api.patch<Lesson>(`courses/lessons/${id}/`, formData);
  return res.data;
}

export async function instructorDeleteLesson(id: number) {
  await api.delete(`courses/lessons/${id}/`);
}

// ------- Quizzes -------
import type { Quiz, Question, Choice } from "../types/courses";

// lista de quizzes por curso o módulo
export async function instructorListQuizzes(params: {
  course_id?: number;
  module_id?: number;
}) {
  const res = await api.get<Quiz[]>("courses/quizzes/", { params });
  return res.data;
}

export async function instructorCreateQuiz(payload: {
  course?: number | null;
  module?: number | null;
  titulo: string;
  descripcion?: string;
}) {
  const res = await api.post<Quiz>("courses/quizzes/", payload);
  return res.data;
}

export async function instructorUpdateQuiz(
  id: number,
  payload: Partial<{ titulo: string; descripcion: string }>
) {
  const res = await api.patch<Quiz>(`courses/quizzes/${id}/`, payload);
  return res.data;
}

export async function instructorDeleteQuiz(id: number) {
  await api.delete(`courses/quizzes/${id}/`);
}

// ------- Questions -------
export async function instructorListQuestions(params: { quiz_id: number }) {
  const res = await api.get<Question[]>("courses/questions/", { params });
  return res.data;
}

export async function instructorCreateQuestion(payload: {
  quiz: number;
  texto: string;
  orden?: number;
}) {
  const res = await api.post<Question>("courses/questions/", payload);
  return res.data;
}

export async function instructorUpdateQuestion(
  id: number,
  payload: Partial<{ texto: string; orden: number }>
) {
  const res = await api.patch<Question>(`courses/questions/${id}/`, payload);
  return res.data;
}

export async function instructorDeleteQuestion(id: number) {
  await api.delete(`courses/questions/${id}/`);
}

// ------- Choices -------
export async function instructorListChoices(params: { question_id: number }) {
  const res = await api.get<Choice[]>("courses/choices/", { params });
  return res.data;
}

export async function instructorCreateChoice(payload: {
  question: number;
  texto: string;
  correcta: boolean;
}) {
  const res = await api.post<Choice>("courses/choices/", payload);
  return res.data;
}

export async function instructorUpdateChoice(
  id: number,
  payload: Partial<{ texto: string; correcta: boolean }>
) {
  const res = await api.patch<Choice>(`courses/choices/${id}/`, payload);
  return res.data;
}

export async function instructorDeleteChoice(id: number) {
  await api.delete(`courses/choices/${id}/`);
}
