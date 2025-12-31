import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { useToast } from "../components/ui/ToastProvider";
import { getErrorMessage } from "../services/errors";
import type { Course } from "../types/courses";
import {
  instructorCreateCourse,
  instructorListCourses,
} from "../services/instructorService";

type CourseCategoria = "programacion" | "diseno" | "datos";
type CourseNivel = "basico" | "intermedio" | "avanzado";

const selectBase =
  "h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm shadow-sm outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-500";

export function InstructorCoursesPage() {
  const toast = useToast();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<Course[]>([]);

  const [creating, setCreating] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] =
    useState<CourseCategoria>("programacion");
  const [nivel, setNivel] = useState<CourseNivel>("basico");
  const [duracion, setDuracion] = useState<number>(60);

  async function load() {
    setLoading(true);
    try {
      const data = await instructorListCourses();
      setItems(data);
    } catch (e) {
      toast.error(
        getErrorMessage(e, "No se pudieron cargar tus cursos."),
        "Instructor"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    document.title = "Mis cursos | Instructor";
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onCreate() {
    if (!titulo.trim()) return;

    setCreating(true);
    try {
      const c = await instructorCreateCourse({
        titulo: titulo.trim(),
        descripcion: "Descripción pendiente",
        categoria,
        nivel,
        duracion: Number(duracion) || 0,
        estado: "borrador",
      });

      toast.success("Curso creado.", "Instructor");
      setTitulo("");
      await load();

      navigate(`/instructor/courses/${c.id}/edit`, { replace: false });
    } catch (e) {
      toast.error(
        getErrorMessage(e, "No se pudo crear el curso."),
        "Instructor"
      );
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-slate-900">
          Mis cursos (Instructor)
        </h1>
        <Button
          variant="secondary"
          onClick={load}
          disabled={loading}
        >
          Recargar
        </Button>
      </div>

      {/* Crear curso */}
      <div className="card space-y-3">
        <div className="text-sm font-semibold text-slate-900">
          Crear curso
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Título del curso"
            />
          </div>

          <select
            className={selectBase}
            value={categoria}
            onChange={(e) =>
              setCategoria(e.target.value as CourseCategoria)
            }
          >
            <option value="programacion">Programación</option>
            <option value="diseno">Diseño</option>
            <option value="datos">Datos</option>
          </select>

          <select
            className={selectBase}
            value={nivel}
            onChange={(e) =>
              setNivel(e.target.value as CourseNivel)
            }
          >
            <option value="basico">basico</option>
            <option value="intermedio">intermedio</option>
            <option value="avanzado">avanzado</option>
          </select>

          <div className="sm:col-span-2 lg:col-span-1">
            <Input
              type="number"
              value={duracion}
              onChange={(e) =>
                setDuracion(Number(e.target.value))
              }
              placeholder="Duración (min)"
              min={0}
            />
          </div>

          <div className="sm:col-span-2 lg:col-span-3">
            <Button
              onClick={onCreate}
              disabled={creating || !titulo.trim()}
            >
              Crear
            </Button>
          </div>
        </div>

        <div className="text-xs text-slate-600">
          El curso se crea en{" "}
          <span className="font-semibold text-slate-900">
            borrador
          </span>{" "}
          con una descripción temporal.
        </div>
      </div>

      {/* Listado de cursos */}
      {loading ? (
        <div className="card">Cargando…</div>
      ) : items.length === 0 ? (
        <div className="card">Aún no tienes cursos.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((c) => (
            <div
              key={c.id}
              className="card flex flex-col justify-between transition-transform duration-150 hover:-translate-y-0.5"
            >
              <div>
                <div className="text-lg font-semibold text-slate-900">
                  {c.titulo}
                </div>

                <div className="mt-2 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                    {c.categoria}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                    {c.nivel}
                  </span>
                  {typeof c.duracion !== "undefined" && (
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-slate-700">
                      {c.duracion} min
                    </span>
                  )}
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Link to={`/courses/${c.id}`} className="flex-1">
                  <Button variant="secondary" className="w-full">
                    Ver
                  </Button>
                </Link>

                <Link
                  to={`/instructor/courses/${c.id}/edit`}
                  className="flex-1"
                >
                  <Button className="w-full">Editar</Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
