import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { registerRequest } from "../services/authService";
import { useToast } from "../components/ui/ToastProvider";
import { getErrorMessage } from "../services/errors";

type Role = "student" | "instructor";

const selectBase =
  "w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm outline-none transition-colors focus:border-blue-400 focus:ring-2 focus:ring-blue-500";

function isValidEmail(v: string) {
  // validación simple (frontend). Backend igual validará.
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());
}

export function RegisterPage() {
  const toast = useToast();
  const navigate = useNavigate();

  const [role, setRole] = useState<Role>("student");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (!username.trim()) return false;
    if (!email.trim() || !isValidEmail(email)) return false;
    if (password.length < 8) return false;
    return true;
  }, [username, email, password]);

  useEffect(() => {
    document.title = "Registro | Learning Platform";
  }, []);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr(null);

    if (password.length < 8) {
      const msg = "La contraseña debe tener mínimo 8 caracteres.";
      setErr(msg);
      toast.error(msg, "Registro");
      return;
    }
    if (!isValidEmail(email)) {
      const msg = "Email inválido.";
      setErr(msg);
      toast.error(msg, "Registro");
      return;
    }

    setBusy(true);
    try {
      await registerRequest({
        username: username.trim(),
        email: email.trim(),
        password,
        role,
      });

      toast.success("Usuario creado. Ahora inicia sesión.", "Registro");
      navigate("/login", { replace: true });
    } catch (e2: any) {
      const data = e2?.response?.data;

      const msg =
        data?.username?.[0] ??
        data?.email?.[0] ??
        data?.password?.[0] ??
        data?.role?.[0] ??
        data?.detail ??
        getErrorMessage(e2, "No se pudo crear el usuario.");

      setErr(msg);
      toast.error(msg, "Registro");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-md">
        <div className="card text-left">
          <h1 className="text-xl font-bold text-slate-900">Registro</h1>

          <form className="mt-6 space-y-4" onSubmit={onSubmit}>
            <div>
              <div className="mb-1 text-sm font-medium text-slate-900">
                Rol
              </div>
              <select
                className={selectBase}
                value={role}
                disabled={busy}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <option value="student">Estudiante</option>
                <option value="instructor">Instructor</option>
              </select>
            </div>

            <div>
              <div className="mb-1 text-sm font-medium text-slate-900">
                Usuario
              </div>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={busy}
              />
            </div>

            <div>
              <div className="mb-1 text-sm font-medium text-slate-900">
                Email
              </div>
              <Input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={busy}
                autoComplete="email"
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
                disabled={busy}
                autoComplete="new-password"
              />
              <div className="mt-1 text-xs text-slate-500">
                Mínimo 8 caracteres.
              </div>
            </div>

            {err && (
              <div className="text-sm text-red-600">{err}</div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={!canSubmit || busy}
            >
              {busy ? "Creando…" : "Crear cuenta"}
            </Button>

            <div className="text-sm text-slate-600">
              ¿Ya tienes cuenta?{" "}
              <Link
                to="/login"
                className="font-semibold text-blue-600 hover:text-blue-700"
              >
                Login
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
