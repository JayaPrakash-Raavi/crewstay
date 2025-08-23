export async function api<T = any>(
  path: string,
  init: RequestInit & { noThrow?: boolean } = {}
): Promise<T> {
  const BASE = import.meta.env.VITE_API_BASE?.replace(/\/$/, "") || "";
  const url = BASE ? `${BASE}${path}` : path;

  const headers = new Headers(init.headers || {});
  if (!headers.has("Content-Type") && init.body) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    credentials: "include",   // <-- send/receive cookies
    ...init,
    headers,
  });

  if (!res.ok && !init.noThrow) {
    let msg = `HTTP ${res.status}`;
    try { msg = (await res.json())?.error || msg; } catch {}
    throw new Error(msg);
  }

  try { return (await res.json()) as T; } catch { return {} as T; }
}
