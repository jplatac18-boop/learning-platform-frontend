// src/components/CourseCard.tsx
import { Link } from "react-router-dom";
import type { Course } from "../types/courses";
import { ProgressBar } from "./ui/ProgressBar";

type Props = {
  course: Course;
  to: string;
  progress?: number; // opcional para “Mis cursos”
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
};

export function CourseCard({
  course,
  to,
  progress,
  primaryActionLabel = "Ver curso",
  secondaryActionLabel,
}: Props) {
  return (
    <Link
      to={to}
      className="card group flex flex-col text-left transition-transform duration-150 hover:-translate-y-0.5"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-lg font-semibold text-slate-900">
            {course.titulo}
          </div>
          <p className="mt-2 line-clamp-3 text-sm text-slate-700">
            {course.descripcion}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2 text-xs">
        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
          {course.categoria}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
          {course.nivel}
        </span>
        <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
          {course.duracion} min
        </span>
      </div>

      {typeof progress === "number" && (
        <div className="mt-4">
          <div className="mb-1 flex items-center justify-between text-xs text-slate-600">
            <span>Progreso</span>
            <span className="font-semibold text-blue-600">{progress}%</span>
          </div>
          <ProgressBar value={progress} />
        </div>
      )}

      <div className="mt-4 flex gap-2 text-sm">
        <span className="inline-flex flex-1 items-center justify-center rounded-md bg-blue-600 px-3 py-1.5 font-semibold text-white shadow-sm transition-colors transition-transform duration-150 group-hover:bg-blue-700 group-hover:-translate-y-0.5">
          {primaryActionLabel}
        </span>
        {secondaryActionLabel && (
          <span className="inline-flex flex-1 items-center justify-center rounded-md border border-slate-200 px-3 py-1.5 font-semibold text-slate-700 shadow-sm transition-colors transition-transform duration-150 group-hover:border-blue-200 group-hover:text-blue-700 group-hover:-translate-y-0.5">
            {secondaryActionLabel}
          </span>
        )}
      </div>
    </Link>
  );
}
