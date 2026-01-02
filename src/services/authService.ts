// src/services/authService.ts
import type { AuthTokens, AuthUser } from "../types/auth";
import { storage } from "./storage";

type RegisterPayload = {
  username: string;
  email: string;
  password: string;
  role: "student" | "instructor";
};

// Usuarios guardados en el store
export type StoredUser = AuthUser & {
  password: string;
};

function readUsers(): StoredUser[] {
  const data = storage.readStore() as any;
  return Array.isArray(data.users) ? (data.users as StoredUser[]) : [];
}

function writeUsers(users: StoredUser[]) {
  const data = storage.readStore() as any;
  data.users = users;
  storage.writeStore(data);
}

function fakeTokens(username: string): AuthTokens {
  const now = Date.now();
  return {
    access: `access-${username}-${now}`,
    refresh: `refresh-${username}-${now}`,
  };
}

/**
 * Login local: valida usuario/contraseña y devuelve { user, tokens }.
 */
export async function loginRequest(
  username: string,
  password: string
): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  const users = readUsers();
  const user = users.find((u) => u.username === username);

  if (!user || user.password !== password) {
    throw new Error("Credenciales inválidas");
  }

  const tokens = fakeTokens(username);
  const { password: _pw, ...authUser } = user;

  return { user: authUser, tokens };
}

/**
 * /me “local”: en un mock puro puedes simplemente devolver el usuario
 * a partir de su id o username si lo necesitas.
 * Si ya usas useAuth para guardar la sesión, podrías no usar esta función.
 */
export async function meRequest(userId: number): Promise<AuthUser> {
  const users = readUsers();
  const user = users.find((u) => u.id === userId);
  if (!user) throw new Error("No autenticado");
  const { password: _pw, ...authUser } = user;
  return authUser;
}

/**
 * Registro local: crea usuario y devuelve { user, tokens } para que
 * el componente llame a auth.login({ user, tokens }).
 */
export async function registerRequest(
  payload: RegisterPayload
): Promise<{ user: AuthUser; tokens: AuthTokens }> {
  const users = readUsers();

  const exists =
    users.some((u) => u.username === payload.username) ||
    users.some((u) => u.email === payload.email);

  if (exists) {
    throw new Error("El usuario o email ya existe");
  }

  const newUser: StoredUser = {
    id: users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1,
    username: payload.username,
    email: payload.email,
    role: payload.role,
    password: payload.password,
  };

  const updated = [...users, newUser];
  writeUsers(updated);

  const tokens = fakeTokens(newUser.username);
  const { password: _pw, ...authUser } = newUser;

  return { user: authUser, tokens };
}

// Logout real lo hace useAuth limpiando lp_session.
// Este helper es opcional; lo puedes borrar si no se usa.
export function logoutMock() {
  const data = storage.readStore() as any;
  data.session = null;
  storage.writeStore(data);
}
