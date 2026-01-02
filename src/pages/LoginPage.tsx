// src/pages/LoginPage.tsx
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { loginRequest } from "../services/authService";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../components/ui/ToastProvider";
import { getErrorMessage } from "../services/errors";

type LocationState = {
  from?: { pathname: string };
};

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  const { login, isAuthenticated } = useAuth();

  const state = (location.state as LocationState | null) ?? null;
  const redirectTo = useMemo(
    () => state?.from?.pathname ?? "/",
    [state]
  );

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Login | Learning Platform";
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);

    if (!username.trim() || !password) return;

    setBusy(true);
    try {
      const { user, tokens } = await loginRequest(
        username.trim(),
        password
      );

      login({ user, tokens });

      toast.success("Bienvenido.", "Login");
      navigate(redirectTo, { replace: true });
    } catch (e2: any) {
      const msg = getErrorMessage(e2, "Credenciales inválidas.");
      setErr(msg);
      toast.error(msg, "Login");
    } finally {
      setBusy(false);
    }
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md">
        <div className="card text-left">
          <h1 className="text-xl font-bold text-slate-900">Inicia sesión</h1>
          <p className="mt-1 text-sm text-slate-600">
            Accede a tus cursos y panel de instructor.
          </p>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <div className="mb-1 text-sm font-medium text-slate-900">
                Usuario
              </div>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                disabled={busy}
              />
            </div>

            <div>
              <div className="mb-1 text-sm font-medium text-slate-900">
                Contraseña
              </div>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                disabled={busy}
              />
            </div>

            {err && (
              <div className="text-sm text-red-600">{err}</div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={busy || !username.trim() || !password}
            >
              {busy ? "Entrando…" : "Entrar"}
            </Button>

            <div className="text-sm text-slate-600">
              ¿No tienes cuenta?{" "}
              <Link
                to="/register"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Regístrate
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
