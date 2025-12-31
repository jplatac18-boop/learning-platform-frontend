export type CourseEstado = "borrador" | "publicado";

export interface Course {
  id: number;
  titulo: string;
  descripcion: string;
  categoria: string;

  /**
   * En tu backend es CharField (no enum fijo).
   * Si quieres, luego lo convertimos a union basado en valores reales.
   */
  nivel: string;

  duracion: number;
  imagen: string;      // en tu modelo es URLField default ""
  estado: CourseEstado;

  created_at: string;  // ISO-8601 [web:1204]
  updated_at: string;  // ISO-8601 [web:1204]

  // depende de tu serializer: a veces viene como id, a veces objeto anidado
  instructor?: number | { id: number; user?: number; username?: string };
}

export interface Module {
  id: number;
  course: number;
  titulo: string;
  orden: number;
}

export type LessonTipo = "video" | "texto" | "archivo";

export interface Lesson {
  id: number;
  module: number;
  titulo: string;
  tipo: LessonTipo;

  contenido: string;
  url_video: string;

  // En DRF, FileField suele devolver URL (string) o null si no hay archivo
  archivo: string | null;

  orden: number;
}

/**
 * OJO: tu Quiz puede colgar de course o module, uno de los dos.
 */
export interface Quiz {
  id: number;
  course: number | null;
  module: number | null;
  titulo: string;
  descripcion: string;
}

export interface Question {
  id: number;
  quiz: number;
  texto: string;
  orden: number;
}

export interface Choice {
  id: number;
  question: number;
  texto: string;
  correcta: boolean;
}