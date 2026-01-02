// src/services/feedbackService.ts
import type { Comment, CourseRating, RatingSummary } from "../types/feedback";
import { storage, type DataStore } from "./storage";
import { getSession } from "./session";

function currentUserId(): number {
  const session = getSession();
  return session?.user.id ?? 1;
}

export async function listComments(params: {
  course?: number;
  lesson?: number;
}): Promise<Comment[]> {
  const data = storage.readStore() as DataStore;
  return data.comments.filter((c) => {
    if (params.course && c.course !== params.course) return false;
    if (params.lesson && c.lesson !== params.lesson) return false;
    return true;
  });
}

export async function createComment(payload: {
  course?: number | null;
  lesson?: number | null;
  texto: string;
}): Promise<Comment> {
  const data = storage.readStore() as DataStore;
  const id = storage.nextId(data.comments);
  const now = new Date().toISOString();

  const comment: Comment = {
    id,
    user: currentUserId(),
    course: payload.course ?? null,
    lesson: payload.lesson ?? null,
    texto: payload.texto,
    fecha: now,
  };

  data.comments.push(comment);
  storage.writeStore(data);
  return comment;
}

export async function rateCourse(payload: {
  course: number;
  rating: number;
}): Promise<CourseRating> {
  const data = storage.readStore() as DataStore;
  const id = storage.nextId(data.ratings);
  const now = new Date().toISOString();

  const rating: CourseRating = {
    id,
    user: currentUserId(),
    course: payload.course,
    rating: payload.rating,
    fecha: now,
  };

  data.ratings.push(rating);
  storage.writeStore(data);
  return rating;
}

export async function ratingSummary(courseId: number): Promise<RatingSummary> {
  const data = storage.readStore() as DataStore;
  const ratings = data.ratings.filter((r) => r.course === courseId);

  if (!ratings.length) {
    return {
      course_id: courseId,
      avg_rating: null,
      ratings_count: 0,
    };
  }

  const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
  const avg = sum / ratings.length;

  return {
    course_id: courseId,
    avg_rating: avg,
    ratings_count: ratings.length,
  };
}
