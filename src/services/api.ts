import axios from "axios";

const LS_KEY = "lp_session";

function getSession(): any | null {
  const raw = localStorage.getItem(LS_KEY);
  return raw ? JSON.parse(raw) : null;
}

function setSession(session: any) {
  localStorage.setItem(LS_KEY, JSON.stringify(session));
}

// HOST sin /api
const API_HOST = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000";

export const api = axios.create({
  baseURL: `${API_HOST}/api/`,
});

api.interceptors.request.use((config) => {
  const session = getSession();
  const token = session?.tokens?.access;
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const isFormData =
    typeof FormData !== "undefined" && config.data instanceof FormData;

  if (isFormData) {
    if (config.headers && "Content-Type" in config.headers) {
      delete (config.headers as any)["Content-Type"];
    }
  } else {
    if (config.headers && !(config.headers as any)["Content-Type"]) {
      (config.headers as any)["Content-Type"] = "application/json";
    }
  }

  return config;
});

let refreshing: Promise<string> | null = null;

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;

    if (err?.response?.status !== 401 || original?._retry) throw err;
    original._retry = true;

    if (!refreshing) {
      refreshing = (async () => {
        const session = getSession();
        const refresh = session?.tokens?.refresh;
        if (!refresh) throw err;

        const r = await axios.post(`${API_HOST}/api/token/refresh/`, { refresh });
        const newAccess = r.data.access;

        setSession({
          ...session,
          tokens: { ...session.tokens, access: newAccess },
        });
        return newAccess;
      })().finally(() => {
        refreshing = null;
      });
    }

    const newAccess = await refreshing;
    original.headers.Authorization = `Bearer ${newAccess}`;
    return api(original);
  }
);
