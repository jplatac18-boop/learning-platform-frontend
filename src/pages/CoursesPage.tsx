import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useToast } from "../components/ui/ToastProvider";
import { getErrorMessage } from "../services/errors";
import { listCourses } from "../services/coursesService";
import { useDebouncedValue } from "../hooks/useDebouncedValue";
import type { Course } from "../types/courses";
import type { Enrollment } from "../types/enrollments";
import { myEnrollments } from "../services/enrollmentService";
import { useAuth } from "../hooks/useAuth";

/**
 * Ajusta estos valores a los reales del backend (Course.level).
 */
const levels = ["basico", "intermedio", "avanzado"] as const;

export function CoursesPage() {
  const toast = useToast();
  const { user } = useAuth();

  const [items, setItems] = useState<Course[]>([]);
  const [count, setCount] = useState(0);
  const [next, setNext] = useState<string | null>(null);
  const [previous, setPrevious] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebouncedValue(search, 450);

  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [ordering, setOrdering] = useState("");

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  // Si cambian filtros, vuelve a página 1
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, level, ordering]);

  // cargar cursos
  useEffect(() => {
    let alive = true;

    async function load() {
      setLoading(true);
      try {
        const r = await listCourses({
          page,
          search: debouncedSearch.trim() || undefined,
          category: category || undefined,
          level: level || undefined,
          ordering: ordering || undefined,
        });

        if (!alive) return;
        setItems(r.items);
        setCount(r.count);
        setNext(r.next);
        setPrevious(r.previous);
      } catch (e) {
        toast.error(
          getErrorMessage(e, "No se pudieron cargar los cursos."),
          "Cursos"
        );
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, [page, debouncedSearch, category, level, ordering, toast]);

  // cargar enrollments del usuario para progreso
  useEffect(() => {
    if (!user) {
      setEnrollments([]);
      return;
    }

    let alive = true;
    setLoadingEnrollments(true);

    myEnrollments()
      .then((data) => {
        if (!alive) return;
        setEnrollments(data);
      })
      .catch(() => {
        // silencioso
      })
      .finally(() => {
        if (alive) setLoadingEnrollments(false);
      });

    return () => {
      alive = false;
    };
  }, [user]);

  const totalPages = useMemo(() => {
    const pageSizeGuess = items.length || 1;
    return Math.max(1, Math.ceil(count / pageSizeGuess));
  }, [count, items.length]);

  const canPrev = page > 1 && previous !== null;
  const canNext = !!next;

  function getCourseProgress(courseId: number): number | null {
    const enr = enrollments.find(
      (e) => e.courseId === courseId && e.status === "active"
    );
    return enr ? enr.progress : null;
  }

  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Cursos</h1>
        <div className="text-sm text-slate-600">{count} resultados</div>
      </div>

      <div className="card">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Filtros
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <div className="text-xs font-semibold text-slate-700">Buscar</div>
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por título o descripción…"
            />
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-700">
              Categoría
            </div>
            <select
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-500"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">Todas</option>
              <option value="programacion">Programación</option>
              <option value="diseno">Diseño</option>
              <option value="datos">Datos</option>
            </select>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-700">Nivel</div>
            <select
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-500"
              value={level}
              onChange={(e) => setLevel(e.target.value)}
            >
              <option value="">Todos</option>
              {levels.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>

          <div>
            <div className="text-xs font-semibold text-slate-700">Orden</div>
            <select
              className="mt-1 h-10 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-500"
              value={ordering}
              onChange={(e) => setOrdering(e.target.value)}
            >
              <option value="">Relevancia</option>
              <option value="title">Título (A-Z)</option>
              <option value="-title">Título (Z-A)</option>
              <option value="duration">Duración (↑)</option>
              <option value="-duration">Duración (↓)</option>
            </select>
          </div>

          <div className="flex items-end gap-2 lg:col-span-4">
            <Button
              variant="secondary"
              onClick={() => {
                setSearch("");
                setCategory("");
                setLevel("");
                setOrdering("");
              }}
            >
              Limpiar filtros
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="card">
          Cargando cursos desde el almacenamiento local…
        </div>
      ) : items.length === 0 ? (
        <div className="card">
          <div className="text-sm font-semibold text-slate-900">
            Sin resultados
          </div>
          <div className="mt-2 text-sm text-slate-600">
            Prueba con otra búsqueda o quita filtros.
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => {
            const progress = getCourseProgress(c.id);
            return (
              <div
                key={c.id}
                className="card flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5"
              >
                <div>
                  <div className="text-lg font-semibold text-slate-900">
                    {c.title}
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm text-slate-700">
                    {c.description}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                      {c.category}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                      {c.level}
                    </span>
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                      {c.duration} min
                    </span>
                  </div>

                  {user && progress !== null && (
                    <div className="mt-3 text-xs text-slate-700">
                      Progreso:{" "}
                      <span className="font-semibold text-slate-900">
                        {progress.toFixed(0)}%
                      </span>
                      {loadingEnrollments && " (actualizando…)"}
                    </div>
                  )}
                </div>

                <div className="mt-4">
                  <Link to={`/courses/${c.id}`}>
                    <Button className="w-full">
                      {progress !== null ? "Continuar" : "Ver curso"}
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-between">
        <Button
          variant="secondary"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={!canPrev || loading}
        >
          Anterior
        </Button>

        <div className="text-sm text-slate-600">
          Página {page} de {totalPages}
        </div>

        <Button
          variant="secondary"
          onClick={() => setPage((p) => p + 1)}
          disabled={!canNext || loading || items.length === 0}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
