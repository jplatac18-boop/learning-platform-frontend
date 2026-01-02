import type { AuthUser, AuthTokens } from "../types/auth";

const LS_KEY = "lp_session";

export type SessionData = {
  user: AuthUser;
  tokens: AuthTokens;
};

export function getSession(): SessionData | null {
  const raw = localStorage.getItem(LS_KEY);
  return raw ? (JSON.parse(raw) as SessionData) : null;
}

export function setSession(session: SessionData) {
  localStorage.setItem(LS_KEY, JSON.stringify(session));
}

export function clearSession() {
  localStorage.removeItem(LS_KEY);
}
