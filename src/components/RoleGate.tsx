import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { JSX } from "react";

export default function RoleGate({
  allow, children,
}: { allow: Array<"EMPLOYER"|"FRONTDESK"|"ADMIN">; children: JSX.Element }) {
  const { role, loading } = useAuth();
  if (loading) return <div style={{ padding: 24 }}>Loading…</div>;
  if (!role || !allow.includes(role)) return <Navigate to="/dashboard" replace />;
  return children;
}
