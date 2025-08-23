import { Navigate, useLocation } from "react-router-dom";
import { Center, Loader } from "@mantine/core";
import { useAuth } from "../context/AuthContext";

type Role = "EMPLOYER" | "FRONTDESK" | "ADMIN";

export default function RoleGate({
  allow,
  children,
}: {
  allow: Role[];
  children: React.ReactNode;
}) {
  const { user, role, loading } = useAuth();
  const loc = useLocation();
  const next = encodeURIComponent(loc.pathname + loc.search);

  if (loading) return <Center mih={240}><Loader /></Center>;
  if (!user) return <Navigate to={`/login?next=${next}`} replace />;

  if (!role || !allow.includes(role)) {
    // Not your role → block
    return <Navigate to="/403" replace />;
  }

  return <>{children}</>;
}
