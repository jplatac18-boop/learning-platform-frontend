import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";

type ToastType = "success" | "error" | "info";

type Toast = {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
};

type ToastApi = {
  push: (t: Omit<Toast, "id">) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
};

const ToastContext = createContext<ToastApi | undefined>(undefined);

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const remove = (id: string) => {
    const t = timersRef.current.get(id);
    if (t) window.clearTimeout(t);
    timersRef.current.delete(id);
    setToasts((prev) => prev.filter((x) => x.id !== id));
  };

  const push = (t: Omit<Toast, "id">) => {
    const id = uid();
    setToasts((prev) => [...prev, { ...t, id }]);

    const timer = window.setTimeout(() => remove(id), 3500);
    timersRef.current.set(id, timer);
  };

  useEffect(() => {
    return () => {
      // cleanup on unmount
      timersRef.current.forEach((timer) => window.clearTimeout(timer));
      timersRef.current.clear();
    };
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      push,
      success: (message, title) => push({ type: "success", title, message }),
      error: (message, title) => push({ type: "error", title, message }),
      info: (message, title) => push({ type: "info", title, message }),
    }),
    []
  );

  return (
    <ToastContext.Provider value={api}>
      {children}

      {/* Toast stack */}
      <div
        className="pointer-events-none fixed right-4 top-4 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col gap-3"
        aria-label="Notificaciones"
      >
        {toasts.map((t) => {
          const liveRole = t.type === "error" ? "alert" : "status";

          const border =
            t.type === "success"
              ? "border-emerald-300/70"
              : t.type === "error"
              ? "border-red-300/70"
              : "border-slate-200/80";

          const accentBg =
            t.type === "success"
              ? "bg-emerald-500"
              : t.type === "error"
              ? "bg-red-500"
              : "bg-blue-500";

          return (
            <div
              key={t.id}
              role={liveRole}
              aria-atomic="true"
              className={[
                "pointer-events-auto overflow-hidden rounded-xl border bg-white/90 p-3 shadow-lg shadow-slate-900/10 backdrop-blur-md",
                "animate-[toast-in_0.18s_ease-out]",
                border,
              ].join(" ")}
            >
              <div className="flex items-start gap-3">
                <div
                  className={[
                    "mt-1 h-2.5 w-2.5 rounded-full",
                    accentBg,
                  ].join(" ")}
                  aria-hidden="true"
                />
                <div className="min-w-0 flex-1">
                  {t.title ? (
                    <div className="text-sm font-semibold text-slate-900">
                      {t.title}
                    </div>
                  ) : null}
                  <div className="text-sm text-slate-700">{t.message}</div>
                </div>
                <button
                  className="rounded-md bg-transparent px-2 py-1 text-xs font-semibold text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-800"
                  onClick={() => remove(t.id)}
                  type="button"
                >
                  Cerrar
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
