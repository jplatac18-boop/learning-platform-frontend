import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

function Item({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        [
          "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-blue-600 text-white shadow-sm"
            : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

export function DashboardLayout() {
  const { user, hasRole } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-100">
      <div className="container-page grid grid-cols-1 gap-6 py-8 md:grid-cols-[240px_1fr]">
        <aside className="card h-fit md:sticky md:top-8 md:self-start">
          <div className="mb-4">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Panel
            </div>
            <div className="mt-1 text-sm font-semibold text-slate-900">
              Navegación
            </div>
          </div>

          <nav
            aria-label="Secciones del dashboard"
            className="flex flex-col gap-1"
          >
            <Item to="/my-courses" label="Mis cursos" />

            {hasRole(["instructor", "admin"]) && (
              <Item to="/instructor/courses" label="Instructor" />
            )}

            {hasRole(["admin"]) && (
              <Item to="/admin/dashboard" label="Admin" />
            )}
          </nav>

          {user && (
            <div className="mt-4 border-t border-slate-200 pt-3 text-xs text-slate-600">
              <div className="font-semibold text-slate-800">
                {user.username}
              </div>
              <div className="mt-0.5">
                Rol:{" "}
                <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-700">
                  {user.role}
                </span>
              </div>
            </div>
          )}
        </aside>

        <section className="card">
          <Outlet />
        </section>
      </div>
    </div>
  );
}
