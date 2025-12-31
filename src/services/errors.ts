import axios from "axios";

function firstString(x: unknown): string | null {
  if (typeof x === "string") return x;
  if (Array.isArray(x)) {
    const s = x.find((v) => typeof v === "string");
    return s ?? null;
  }
  return null;
}

export function getErrorMessage(err: unknown, fallback = "Ocurrió un error.") {
  if (axios.isAxiosError(err)) {
    const data: any = err.response?.data;

    // DRF típico: {"detail": "..."} o {"detail": ["..."]}
    const detail = firstString(data?.detail);
    if (detail) return detail;

    // A veces: {"message": "..."}
    const message = firstString(data?.message);
    if (message) return message;

    // DRF ValidationError: {"field": ["..."], "other": ["..."]}
    if (data && typeof data === "object" && !Array.isArray(data)) {
      // non_field_errors primero
      const nfe = firstString(data?.non_field_errors);
      if (nfe) return nfe;

      // primer campo con error
      for (const key of Object.keys(data)) {
        const msg = firstString(data[key]);
        if (msg) return msg;
      }
    }

    // Si el backend devolvió texto plano
    if (typeof data === "string" && data.trim()) return data;

    return err.message || fallback;
  }

  if (err instanceof Error) return err.message;
  return fallback;
}
