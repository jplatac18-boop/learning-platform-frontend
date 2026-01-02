// src/services/session.ts
import type { AuthTokens, AuthUser } from "../types/auth";

const LS_KEY = "lp_session";

export type SessionData = {
  user: AuthUser;
  tokens: AuthTokens;
};

export function getSession(): SessionData | null {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionData;
  } catch {
    localStorage.removeItem(LS_KEY);
    return null;
  }
}

export function setSession(session: SessionData | null) {
  if (!session) {
    localStorage.removeItem(LS_KEY);
    return;
  }
  localStorage.setItem(LS_KEY, JSON.stringify(session));
}
