import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import type { Course } from "../types/courses";
import type { Enrollment } from "../types/enrollments";
import { myEnrollments } from "../services/enrollmentService";
import { getCourseDetail } from "../services/coursesService";
import { Button } from "../components/ui/Button";
import { useToast } from "../components/ui/ToastProvider";
import { getErrorMessage } from "../services/errors";
import { CourseCard } from "../components/CourseCard";

type CourseMap = Record<number, Course>;

export function MyCoursesPage() {
  const toast = useToast();

  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [coursesById, setCoursesById] = useState<CourseMap>({});

  const activeEnrollments = useMemo(
    () => enrollments.filter((e) => e.status === "active"),
    [enrollments]
  );

  async function load(aliveRef?: { current: boolean }) {
    const isAlive = () => (aliveRef ? aliveRef.current : true);

    setLoading(true);
    try {
      const items = await myEnrollments();
      if (!isAlive()) return;

      setEnrollments(items);

      const uniqueCourseIds = Array.from(
        new Set(items.map((e) => e.courseId))
      );
      const missing = uniqueCourseIds.filter((cid) => !coursesById[cid]);

      if (missing.length > 0) {
        const pairs = await Promise.all(
          missing.map(async (cid) => {
            const c = await getCourseDetail(cid);
            return [cid, c] as const;
          })
        );

        if (!isAlive()) return;

        setCoursesById((prev) => {
          const next: CourseMap = { ...prev };
          for (const [cid, c] of pairs) next[cid] = c;
          return next;
        });
      }
    } catch (e) {
      toast.error(
        getErrorMessage(e, "No se pudieron cargar tus cursos."),
        "Mis cursos"
      );
    } finally {
      if (isAlive()) setLoading(false);
    }
  }

  useEffect(() => {
    const aliveRef = { current: true };
    document.title = "Mis cursos | Learning Platform";
    load(aliveRef);
    return () => {
      aliveRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) {
    return <div className="card text-left">Cargando tus cursos…</div>;
  }

  if (activeEnrollments.length === 0) {
    return (
      <div className="space-y-4 text-left">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-slate-900">Mis cursos</h1>
          <Link
            to="/"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Ver catálogo
          </Link>
        </div>

        <div className="card">
          <div className="text-sm font-semibold text-slate-900">
            Aún no tienes cursos activos
          </div>
          <p className="mt-2 text-sm text-slate-700">
            Explora el catálogo e inscríbete en uno para empezar.
          </p>
          <div className="mt-4 flex gap-2">
            <Link to="/" className="inline-flex">
              <Button>Ir al catálogo</Button>
            </Link>
            <Button variant="secondary" onClick={() => load()}>
              Recargar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">Mis cursos</h1>
        <div className="flex items-center gap-3">
          <Button variant="secondary" onClick={() => load()}>
            Recargar
          </Button>
          <Link
            to="/"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700"
          >
            Ver catálogo
          </Link>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {activeEnrollments.map((e) => {
          const c = coursesById[e.courseId];

          if (!c) {
            return (
              <div
                key={e.id}
                className="card text-left text-sm text-slate-500"
              >
                Cargando detalle del curso #{e.courseId}…
              </div>
            );
          }

          return (
            <CourseCard
              key={e.id}
              course={c}
              to={`/courses/${e.courseId}`}
              progress={e.progress}
              primaryActionLabel="Continuar"
              secondaryActionLabel="Ver detalles"
            />
          );
        })}
      </div>
    </div>
  );
}
