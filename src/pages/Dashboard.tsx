import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user, role, loading } = useAuth();
  const nav = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) nav("/login", { replace: true });
    else if (role === "EMPLOYER") nav("/employer", { replace: true });
    else if (role === "FRONTDESK") nav("/frontdesk", { replace: true });
    else if (role === "ADMIN") nav("/admin", { replace: true });
  }, [user, role, loading, nav]);

  return <div style={{ padding: 16 }}>Routing to your dashboard…</div>;
}
