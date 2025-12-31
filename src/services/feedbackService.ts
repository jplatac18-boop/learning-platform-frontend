import { api } from "./api";
import type { Comment, CourseRating, RatingSummary } from "../types/feedback";

export async function listComments(params: { course_id?: number; lesson_id?: number }) {
  const res = await api.get<Comment[]>("feedback/comments/", { params });
  return res.data;
}

export async function createComment(payload: { course?: number; lesson?: number; texto: string }) {
  const res = await api.post<Comment>("feedback/comments/", payload);
  return res.data;
}

export async function rateCourse(payload: { course_id: number; rating: number }) {
  const res = await api.post<CourseRating>("feedback/ratings/rate/", payload);
  return res.data;
}

export async function ratingSummary(course_id: number) {
  const res = await api.get<RatingSummary>("feedback/ratings/summary/", { params: { course_id } });
  return res.data;
}
