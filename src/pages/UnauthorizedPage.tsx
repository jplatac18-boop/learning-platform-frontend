import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export function UnauthorizedPage() {
  useEffect(() => {
    document.title = "No autorizado | Learning Platform";
  }, []);

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="card text-left max-w-md">
        <h1 className="text-xl font-bold text-slate-900">
          No autorizado
        </h1>
        <p className="mt-2 text-sm text-slate-700">
          No tienes permisos para acceder a esta ruta.
        </p>

        <div className="mt-4 flex flex-wrap gap-2">
          <Link to="/">
            <Button>Ir al inicio</Button>
          </Link>

          <Link to="/login">
            <Button variant="secondary">Iniciar sesión</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
