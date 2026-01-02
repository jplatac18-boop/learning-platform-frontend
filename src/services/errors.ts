// src/services/errors.ts
export function getErrorMessage(err: unknown, fallback = "Ocurrió un error.") {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string" && err.trim()) return err;
  return fallback;
}
