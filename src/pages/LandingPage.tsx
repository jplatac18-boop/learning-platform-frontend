import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Course } from "../types/courses";
import { listCourses } from "../services/coursesService.ts";
import { useToast } from "../components/ui/ToastProvider";
import { getErrorMessage } from "../services/errors";
import { CourseCard } from "../components/CourseCard";

export function LandingPage() {
  const toast = useToast();

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  const visibleCourses = useMemo(
    () => courses.slice(0, 9),
    [courses]
  );

  useEffect(() => {
    let alive = true;

    document.title = "Learning Platform | Cursos";

    async function load() {
      setLoading(true);
      try {
        const r = await listCourses({ page: 1 });
        const safeItems: Course[] = Array.isArray(r.items) ? r.items : [];
        if (!alive) return;
        setCourses(safeItems);
      } catch (e) {
        toast.error(
          getErrorMessage(e, "No se pudieron cargar los cursos."),
          "Cursos"
        );
        if (alive) setCourses([]);
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-8">
      {/* Hero */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-blue-50 p-6 shadow-sm">
        <div className="flex flex-col gap-4 text-left sm:flex-row sm:items-center sm:justify-between">
          <div className="max-w-xl">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Catálogo de cursos
            </h1>
            <p className="mt-2 text-sm text-slate-700">
              Explora cursos por categoría y nivel y avanza a tu propio ritmo.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Link to="/courses">
                <span className="inline-flex items-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-transform transition-colors duration-150 hover:-translate-y-0.5 hover:bg-blue-700">
                  Ver todos los cursos
                </span>
              </Link>
            </div>
          </div>

          <div className="flex gap-4 text-xs text-slate-600">
            <div className="rounded-xl border border-slate-200 bg-white/80 px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Cursos publicados
              </div>
              <div className="mt-1 text-base font-bold text-slate-900">
                {courses.length || "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Listado */}
      {loading ? (
        <div className="card text-left">Cargando…</div>
      ) : courses.length === 0 ? (
        <div className="card text-left">No hay cursos disponibles.</div>
      ) : (
        <div className="space-y-3">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCourses.map((c) => (
              <CourseCard
                key={c.id}
                course={c}
                to={`/courses/${c.id}`}
              />
            ))}
          </div>

          {courses.length > visibleCourses.length && (
            <div className="text-left">
              <Link
                to="/courses"
                className="text-sm font-semibold text-blue-600 hover:text-blue-700"
              >
                Ver más cursos
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
