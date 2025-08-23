import { Navigate, useLocation } from "react-router-dom";
import { Center, Loader } from "@mantine/core";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const loc = useLocation();
  const next = encodeURIComponent(loc.pathname + loc.search);

  if (loading) return <Center mih={240}><Loader /></Center>;
  if (!user) return <Navigate to={`/login?next=${next}`} replace />;

  return <>{children}</>;
}
