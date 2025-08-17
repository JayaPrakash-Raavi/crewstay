import { createBrowserRouter, Navigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import Shell from "./components/Shell";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGate from "./components/RoleGate";
import PublicOnly from "./components/PublicOnly";
import type { JSX } from "react/jsx-runtime";

// Lazy pages (keeps initial bundle small)
const Home = lazy(() => import("./pages/Home"));
const Login = lazy(() => import("./pages/Login"));
const Signup = lazy(() => import("./pages/Signup"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const UpdatePassword = lazy(() => import("./pages/UpdatePassword"));

const Dashboard = lazy(() => import("./pages/Dashboard"));
const EmployerHome = lazy(() => import("./pages/employer/Index"));
const FrontDeskHome = lazy(() => import("./pages/frontdesk/Index"));
const AdminHome = lazy(() => import("./pages/admin/Index"));
const Logout = lazy(() => import("./pages/Logout")); // added

const Load = (el: JSX.Element) => (
  <Suspense fallback={<div style={{ padding: 24 }}>Loading…</div>}>{el}</Suspense>
);

export const router = createBrowserRouter([
  // Public-only pages
  { path: "/", element: Load(<PublicOnly><Home /></PublicOnly>) },
  { path: "/login", element: Load(<PublicOnly><Login /></PublicOnly>) },
  { path: "/signup", element: Load(<PublicOnly><Signup /></PublicOnly>) },
  { path: "/forgot-password", element: Load(<PublicOnly><ForgotPassword /></PublicOnly>) },
  { path: "/update-password", element: Load(<PublicOnly><UpdatePassword /></PublicOnly>) },

  // Authenticated area with AppShell
  {
    element: Load(
      <ProtectedRoute>
        <Shell />
      </ProtectedRoute>
    ),
    children: [
      { path: "/dashboard", element: Load(<Dashboard />) },
      {
        path: "/employer",
        element: Load(
          <RoleGate allow={["EMPLOYER"]}>
            <EmployerHome />
          </RoleGate>
        ),
      },
      {
        path: "/frontdesk",
        element: Load(
          <RoleGate allow={["FRONTDESK"]}>
            <FrontDeskHome />
          </RoleGate>
        ),
      },
      {
        path: "/admin",
        element: Load(
          <RoleGate allow={["ADMIN"]}>
            <AdminHome />
          </RoleGate>
        ),
      },
      // handy for header "Sign out"
      { path: "/logout", element: Load(<Logout />) },
    ],
  },

  // Catch-all (last)
  { path: "*", element: <Navigate to="/" replace /> },
]);
