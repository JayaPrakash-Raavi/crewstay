const API_BASE = import.meta.env.VITE_API_BASE ?? "";

function baseUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return `${API_BASE}${path}`;
}

export async function api<T = any>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(baseUrl(path), {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as any)?.error || "Request failed");
  return data as T;
}
