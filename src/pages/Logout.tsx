import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function Logout() {
  const nav = useNavigate();
  useEffect(() => {
    (async () => {
      await supabase.auth.signOut();
      nav("/", { replace: true });
    })();
  }, [nav]);
  return <div style={{ padding: 24 }}>Signing you out…</div>;
}
