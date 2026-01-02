// src/services/storage.ts
import type {
  Course,
  Module,
  Lesson,
  Quiz,
  Question,
  Choice,
} from "../types/courses";
import type { Comment, CourseRating } from "../types/feedback";
import type { Enrollment, LessonProgress, Submission } from "../types/enrollments";

import { coursesSeed } from "../mocks/courses";
// Cuando los tengas, descomenta e importa:
// import { modulesSeed } from "../mocks/modules";
// import { lessonsSeed } from "../mocks/lessons";
// import { quizzesSeed, questionsSeed, choicesSeed } from "../mocks/quizzes";

const KEY = "lp_data_v1";

export type DataStore = {
  courses: Course[];
  modules: Module[];
  lessons: Lesson[];
  quizzes: Quiz[];
  questions: Question[];
  choices: Choice[];
  comments: Comment[];
  ratings: CourseRating[];
  enrollments: Enrollment[];
  lessonProgress: LessonProgress[];
  submissions: Submission[];
  users?: any[];
};

// Valores por defecto (con seeds)
const EMPTY_DATA: DataStore = {
  courses: coursesSeed,
  modules: [], // modulesSeed
  lessons: [], // lessonsSeed
  quizzes: [],
  questions: [],
  choices: [],
  comments: [],
  ratings: [],
  enrollments: [],
  lessonProgress: [],
  submissions: [],
};

function readStore(): DataStore {
  const raw = localStorage.getItem(KEY);
  if (!raw) return { ...EMPTY_DATA };
  try {
    const parsed = JSON.parse(raw) as Partial<DataStore>;
    return { ...EMPTY_DATA, ...parsed };
  } catch {
    return { ...EMPTY_DATA };
  }
}

function writeStore(data: DataStore) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

function nextId(items: { id: number }[]): number {
  return items.length ? Math.max(...items.map((i) => i.id)) + 1 : 1;
}

export const storage = { readStore, writeStore, nextId };
