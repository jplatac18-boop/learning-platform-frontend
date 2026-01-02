// useAuth
import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
import type { AuthTokens, AuthUser, Role } from "../types/auth";

const LS_KEY = "lp_session";

export type Session = { user: AuthUser; tokens: AuthTokens };

type AuthState = {
  user: AuthUser | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;

  login: (session: Session) => void;
  logout: () => void;

  // útil si el interceptor renueva access
  updateTokens: (tokens: AuthTokens) => void;

  hasRole: (roles: Role | Role[]) => boolean;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

function readSession(): Session | null {
  const raw = localStorage.getItem(LS_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Session;
  } catch {
    localStorage.removeItem(LS_KEY);
    return null;
  }
}

function writeSession(session: Session | null) {
  if (!session) {
    localStorage.removeItem(LS_KEY);
    return;
  }
  localStorage.setItem(LS_KEY, JSON.stringify(session));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(() => readSession());

  const login = (s: Session) => {
    setSession(s);
    writeSession(s);
  };

  const logout = () => {
    setSession(null);
    writeSession(null);
  };

  const updateTokens = (tokens: AuthTokens) => {
    setSession((prev) => {
      if (!prev) return prev;
      const next = { ...prev, tokens };
      writeSession(next);
      return next;
    });
  };

  const value = useMemo<AuthState>(() => {
    const user = session?.user ?? null;
    const tokens = session?.tokens ?? null;

    return {
      user,
      tokens,
      isAuthenticated: !!user && !!tokens?.access,

      login,
      logout,
      updateTokens,

      hasRole: (roles) => {
        if (!user) return false;
        const allowed = Array.isArray(roles) ? roles : [roles];
        return allowed.includes(user.role);
      },
    };
  }, [session]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}