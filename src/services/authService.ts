// src/services/authService.ts
import axios from "axios";
import { api } from "./api";
import type { AuthTokens, AuthUser } from "../types/auth";

// Igual que API_HOST de api.ts, pero sin /api/
const API_HOST = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

/**
 * Login: se hace SIN pasar por `api` para evitar bucles de interceptores.
 * Devuelve { access, refresh }.
 */
export async function loginRequest(username: string, password: string): Promise<AuthTokens> {
  const res = await axios.post(`${API_HOST}/api/token/`, { username, password });
  return res.data as AuthTokens;
}

/**
 * /me sí usa `api` porque ya habrá token en lp_session.
 */
export async function meRequest(): Promise<AuthUser> {
  const res = await api.get("users/users/me/");
  return res.data as AuthUser;
}

export async function registerRequest(payload: {
  username: string;
  email: string;
  password: string;
  role: "student" | "instructor";
}) {
  const endpoint =
    payload.role === "student"
      ? "users/users/register-student/"
      : "users/users/register-instructor/";
  const res = await api.post(endpoint, payload);
  return res.data;
}
