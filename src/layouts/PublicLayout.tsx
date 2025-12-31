import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Button } from "../components/ui/Button";

function TopLink({ to, label }: { to: string; label: string }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        [
          "rounded-lg px-3 py-2 text-sm font-semibold transition-colors",
          isActive
            ? "bg-slate-100 text-slate-900"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
        ].join(" ")
      }
    >
      {label}
    </NavLink>
  );
}

export function PublicLayout() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const onLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 via-slate-50 to-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
        <div className="container-page flex items-center justify-between py-3">
          <NavLink to="/" className="flex items-center gap-2 text-slate-900" end>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-xs font-bold text-white shadow-sm">
              LP
            </span>
            <span className="text-base font-semibold tracking-tight">
              Learning Platform
            </span>
          </NavLink>

          <nav
            className="flex items-center gap-2"
            aria-label="Navegación principal"
          >
            {isAuthenticated && user ? (
              <>
                <TopLink to="/my-courses" label="Mis cursos" />
                <Button variant="secondary" onClick={onLogout}>
                  Salir
                </Button>
              </>
            ) : (
              <>
                <TopLink to="/login" label="Login" />
                <NavLink
                  to="/register"
                  end
                  className={({ isActive }) =>
                    [
                      "rounded-lg px-3 py-2 text-sm font-semibold text-white shadow-sm transition-colors",
                      isActive
                        ? "bg-blue-700"
                        : "bg-blue-600 hover:bg-blue-700",
                    ].join(" ")
                  }
                >
                  Registrarme
                </NavLink>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="container-page py-8">
        <Outlet />
      </main>
    </div>
  );
}
