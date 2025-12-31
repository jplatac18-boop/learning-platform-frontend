import { useEffect } from "react";

export function AdminDashboardPage() {
  useEffect(() => {
    document.title = "Admin | Learning Platform";
  }, []);

  return (
    <div className="space-y-4 text-left">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Panel de administración</h1>
        <p className="mt-1 text-sm text-slate-600">
          Resumen de la plataforma: estudiantes, cursos, inscripciones y actividad reciente.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Estudiantes
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">—</div>
          <div className="mt-1 text-xs text-slate-500">
            Total registrados en la plataforma.
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Cursos
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">—</div>
          <div className="mt-1 text-xs text-slate-500">
            Cursos publicados y en borrador.
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Inscripciones
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">—</div>
          <div className="mt-1 text-xs text-slate-500">
            Inscripciones activas en todos los cursos.
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Valoración media
          </div>
          <div className="mt-2 text-2xl font-bold text-slate-900">—</div>
          <div className="mt-1 text-xs text-slate-500">
            Promedio global de ratings de cursos.
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/60 p-4 text-sm text-slate-700">
        Próximo paso: conectar endpoints de métricas y mostrar cards/gráficas con datos reales.
      </div>
    </div>
  );
}
