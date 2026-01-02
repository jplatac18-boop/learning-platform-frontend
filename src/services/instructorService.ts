// src/services/instructorService.ts
import type {
  Course,
  Module,
  Lesson,
  Quiz,
  Question,
  Choice,
  CourseLevel,
} from "../types/courses";
import { storage, type DataStore } from "./storage";
import { getSession } from "./session"; // lee la sesión guardada

function currentInstructorId(): number | undefined {
  const session = getSession();
  return session?.user?.id;
}

// ------- Courses -------

export async function instructorListCourses(): Promise<Course[]> {
  const data = storage.readStore() as DataStore;
  return data.courses;
}

export async function instructorCreateCourse(payload: {
  title: string;
  description: string;
  category: string;
  level: CourseLevel;
  duration: number;
  status: "draft" | "published";
}): Promise<Course> {
  const data = storage.readStore() as DataStore;
  const id = storage.nextId(data.courses);
  const now = new Date().toISOString();

  const instructorId = currentInstructorId();

  const course: Course = {
    id,
    title: payload.title,
    description: payload.description,
    category: payload.category,
    level: payload.level,
    duration: payload.duration,
    imageUrl: "", // placeholder
    status: payload.status,
    createdAt: now,
    updatedAt: now,
    instructor: instructorId ?? undefined,
  };

  data.courses.push(course);
  storage.writeStore(data);
  return course;
}

export async function instructorUpdateCourse(
  id: number,
  payload: Partial<{
    title: string;
    description: string;
    category: string;
    level: CourseLevel;
    duration: number;
    status: "draft" | "published";
    imageUrl: string;
  }>
): Promise<Course> {
  const data = storage.readStore() as DataStore;
  const idx = data.courses.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Course not found");

  const updated: Course = {
    ...data.courses[idx],
    ...payload,
    updatedAt: new Date().toISOString(),
  };

  data.courses[idx] = updated;
  storage.writeStore(data);
  return updated;
}

export async function instructorDeleteCourse(id: number): Promise<void> {
  const data = storage.readStore() as DataStore;
  data.courses = data.courses.filter((c) => c.id !== id);

  const moduleIds = data.modules.filter((m) => m.courseId === id).map((m) => m.id);
  data.modules = data.modules.filter((m) => m.courseId !== id);
  data.lessons = data.lessons.filter((l) => !moduleIds.includes(l.moduleId));
  data.quizzes = data.quizzes.filter(
    (q) => q.courseId !== id && !moduleIds.includes(q.moduleId ?? -1)
  );

  storage.writeStore(data);
}

// ------- Modules -------

export async function instructorListModules(params: {
  courseId: number;
}): Promise<Module[]> {
  const data = storage.readStore() as DataStore;
  return data.modules.filter((m) => m.courseId === params.courseId);
}

export async function instructorCreateModule(payload: {
  courseId: number;
  title: string;
  order?: number;
}): Promise<Module> {
  const data = storage.readStore() as DataStore;
  const id = storage.nextId(data.modules);

  const module: Module = {
    id,
    courseId: payload.courseId,
    title: payload.title,
    order: payload.order ?? 0,
  };

  data.modules.push(module);
  storage.writeStore(data);
  return module;
}

export async function instructorUpdateModule(
  id: number,
  payload: Partial<{ title: string; order: number }>
): Promise<Module> {
  const data = storage.readStore() as DataStore;
  const idx = data.modules.findIndex((m) => m.id === id);
  if (idx === -1) throw new Error("Module not found");

  const updated: Module = { ...data.modules[idx], ...payload };
  data.modules[idx] = updated;
  storage.writeStore(data);
  return updated;
}

export async function instructorDeleteModule(id: number): Promise<void> {
  const data = storage.readStore() as DataStore;
  data.lessons = data.lessons.filter((l) => l.moduleId !== id);
  data.quizzes = data.quizzes.filter((q) => q.moduleId !== id);
  data.modules = data.modules.filter((m) => m.id !== id);
  storage.writeStore(data);
}

// ------- Lessons -------

type LessonCreatePayload = {
  moduleId: number;
  title: string;
  type: "video" | "text" | "file";
  order?: number;
  content?: string;
  videoUrl?: string;
  file?: File;
};

type LessonUpdatePayload = Partial<{
  title: string;
  order: number;
  content: string;
  videoUrl: string;
  file: File;
}>;

export async function instructorListLessons(params: {
  courseId?: number;
  moduleId?: number;
}): Promise<Lesson[]> {
  const data = storage.readStore() as DataStore;
  let lessons = data.lessons;

  if (params.moduleId) {
    lessons = lessons.filter((l) => l.moduleId === params.moduleId);
  }
  if (params.courseId) {
    const moduleIds = data.modules
      .filter((m) => m.courseId === params.courseId)
      .map((m) => m.id);
    lessons = lessons.filter((l) => moduleIds.includes(l.moduleId));
  }

  return lessons;
}

export async function instructorCreateLesson(
  payload: LessonCreatePayload
): Promise<Lesson> {
  const data = storage.readStore() as DataStore;
  const id = storage.nextId(data.lessons);

  let fileUrl: string | null = null;
  if (payload.type === "file" && payload.file) {
    fileUrl = `file-${id}-${payload.file.name}`;
  }

  const lesson: Lesson = {
    id,
    moduleId: payload.moduleId,
    title: payload.title,
    type: payload.type,
    order: payload.order ?? 0,
    content: payload.content ?? "",
    videoUrl: payload.videoUrl ?? "",
    fileUrl,
  };

  data.lessons.push(lesson);
  storage.writeStore(data);
  return lesson;
}

export async function instructorUpdateLesson(
  id: number,
  payload: LessonUpdatePayload
): Promise<Lesson> {
  const data = storage.readStore() as DataStore;
  const idx = data.lessons.findIndex((l) => l.id === id);
  if (idx === -1) throw new Error("Lesson not found");

  let update: Partial<Lesson> = { ...payload };

  if (payload.file) {
    update = {
      ...update,
      fileUrl: `file-${id}-${payload.file.name}`,
    };
  }

  const updated: Lesson = { ...data.lessons[idx], ...update };
  data.lessons[idx] = updated;
  storage.writeStore(data);
  return updated;
}

export async function instructorDeleteLesson(id: number): Promise<void> {
  const data = storage.readStore() as DataStore;
  data.lessons = data.lessons.filter((l) => l.id !== id);
  storage.writeStore(data);
}

// ------- Quizzes -------

export async function instructorListQuizzes(params: {
  courseId: number;
}): Promise<Quiz[]> {
  const data = storage.readStore() as DataStore;
  return data.quizzes.filter(
    (q) =>
      q.courseId === params.courseId ||
      data.modules.some(
        (m) => m.id === q.moduleId && m.courseId === params.courseId
      )
  );
}

export async function instructorCreateQuiz(payload: {
  course: number | null;
  module: number | null;
  title: string;
  description?: string;
}): Promise<Quiz> {
  const data = storage.readStore() as DataStore;
  const id = storage.nextId(data.quizzes);

  const quiz: Quiz = {
    id,
    courseId: payload.course,
    moduleId: payload.module,
    title: payload.title,
    description: payload.description ?? "",
  };

  data.quizzes.push(quiz);
  storage.writeStore(data);
  return quiz;
}

export async function instructorUpdateQuiz(
  id: number,
  payload: Partial<{ title: string; description: string }>
): Promise<Quiz> {
  const data = storage.readStore() as DataStore;
  const idx = data.quizzes.findIndex((q) => q.id === id);
  if (idx === -1) throw new Error("Quiz not found");

  const updated: Quiz = { ...data.quizzes[idx], ...payload };
  data.quizzes[idx] = updated;
  storage.writeStore(data);
  return updated;
}

export async function instructorDeleteQuiz(id: number): Promise<void> {
  const data = storage.readStore() as DataStore;
  data.questions = data.questions.filter((q) => q.quizId !== id);
  data.choices = data.choices.filter((c) =>
    data.questions.some((q) => q.id === c.questionId)
  );
  data.quizzes = data.quizzes.filter((q) => q.id !== id);
  storage.writeStore(data);
}

// ------- Questions -------

export async function instructorListQuestions(params: {
  quizId: number;
}): Promise<Question[]> {
  const data = storage.readStore() as DataStore;
  return data.questions.filter((q) => q.quizId === params.quizId);
}

export async function instructorCreateQuestion(payload: {
  quiz: number;
  text: string;
  order?: number;
}): Promise<Question> {
  const data = storage.readStore() as DataStore;
  const id = storage.nextId(data.questions);

  const question: Question = {
    id,
    quizId: payload.quiz,
    text: payload.text,
    order: payload.order ?? 0,
  };

  data.questions.push(question);
  storage.writeStore(data);
  return question;
}

export async function instructorUpdateQuestion(
  id: number,
  payload: Partial<{ text: string; order: number }>
): Promise<Question> {
  const data = storage.readStore() as DataStore;
  const idx = data.questions.findIndex((q) => q.id === id);
  if (idx === -1) throw new Error("Question not found");

  const updated: Question = { ...data.questions[idx], ...payload };
  data.questions[idx] = updated;
  storage.writeStore(data);
  return updated;
}

export async function instructorDeleteQuestion(id: number): Promise<void> {
  const data = storage.readStore() as DataStore;
  data.choices = data.choices.filter((c) => c.questionId !== id);
  data.questions = data.questions.filter((q) => q.id !== id);
  storage.writeStore(data);
}

// ------- Choices -------

export async function instructorListChoices(params: {
  questionId: number;
}): Promise<Choice[]> {
  const data = storage.readStore() as DataStore;
  return data.choices.filter((c) => c.questionId === params.questionId);
}

export async function instructorCreateChoice(payload: {
  question: number;
  text: string;
  isCorrect: boolean;
}): Promise<Choice> {
  const data = storage.readStore() as DataStore;
  const id = storage.nextId(data.choices);

  const choice: Choice = {
    id,
    questionId: payload.question,
    text: payload.text,
    isCorrect: payload.isCorrect,
  };

  data.choices.push(choice);
  storage.writeStore(data);
  return choice;
}

export async function instructorUpdateChoice(
  id: number,
  payload: Partial<{ text: string; isCorrect: boolean }>
): Promise<Choice> {
  const data = storage.readStore() as DataStore;
  const idx = data.choices.findIndex((c) => c.id === id);
  if (idx === -1) throw new Error("Choice not found");

  const updated: Choice = { ...data.choices[idx], ...payload };
  data.choices[idx] = updated;
  storage.writeStore(data);
  return updated;
}

export async function instructorDeleteChoice(id: number): Promise<void> {
  const data = storage.readStore() as DataStore;
  data.choices = data.choices.filter((c) => c.id !== id);
  storage.writeStore(data);
}

export async function onToggleChoiceCorrect(c: Choice): Promise<Choice> {
  return instructorUpdateChoice(c.id, { isCorrect: !c.isCorrect });
}
