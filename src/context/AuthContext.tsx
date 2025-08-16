import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabaseClient";

type Role = "EMPLOYER" | "FRONTDESK" | "ADMIN";
type AuthCtx = {
  user: any | null;
  role: Role | null;
  loading: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({
  user: null, role: null, loading: true, signOut: async () => {}
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const { data } = await supabase.auth.getSession();
    const u = data.session?.user ?? null;
    setUser(u);
    if (u) {
      const { data: prof } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("id", u.id)
        .maybeSingle();
      setRole((prof?.role as Role) ?? null);
    } else setRole(null);
    setLoading(false);
  }

  useEffect(() => {
    load();
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      const u = session?.user ?? null;
      setUser(u);
      if (u) {
        supabase
          .from("user_profiles")
          .select("role")
          .eq("id", u.id)
          .maybeSingle()
          .then(({ data }) => setRole((data?.role as Role) ?? null));
      } else setRole(null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo(
    () => ({
      user, role, loading,
      signOut: async () => {
        await supabase.auth.signOut();
        setUser(null); setRole(null);
      },
    }),
    [user, role, loading]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
