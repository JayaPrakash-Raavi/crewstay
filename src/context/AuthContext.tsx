import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

export type Role = "EMPLOYER" | "FRONTDESK" | "ADMIN";
export type User = { id: string; email: string; role: Role; name?: string | null };

type AuthCtx = {
  user: User | null;
  role: Role | null;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null, role: null, loading: true, refresh: async () => {}, signOut: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function fetchMe() {
    try {
      const { user } = await api<{ user: User | null }>("/api/me");
      setUser(user ?? null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchMe(); }, []);

  const value = useMemo(() => ({
    user,
    role: user?.role ?? null,
    loading,
    refresh: fetchMe,
    signOut: async () => { await api("/api/logout", { method: "POST" }); setUser(null); }
  }), [user, loading]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
