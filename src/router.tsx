import { createBrowserRouter, Navigate } from "react-router-dom";
import Shell from "./components/Shell";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGate from "./components/RoleGate";
import PublicOnly from "./components/PublicOnly";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";

import Dashboard from "./pages/Dashboard";
import EmployerHome from "./pages/employer/Index";
import FrontDeskHome from "./pages/frontdesk/Index";
import AdminHome from "./pages/admin/Index";

export const router = createBrowserRouter([
  // Public-only pages
  { path: "/", element: <PublicOnly><Home /></PublicOnly> },
  { path: "/login", element: <PublicOnly><Login /></PublicOnly> },
  { path: "/signup", element: <PublicOnly><Signup /></PublicOnly> },
  { path: "/forgot-password", element: <PublicOnly><ForgotPassword /></PublicOnly> },
  { path: "/update-password", element: <PublicOnly><UpdatePassword /></PublicOnly> },

  // Authenticated area with AppShell
  {
    element: (
      <ProtectedRoute>
        <Shell />
      </ProtectedRoute>
    ),
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      {
        path: "/employer",
        element: (
          <RoleGate allow={["EMPLOYER"]}>
            <EmployerHome />
          </RoleGate>
        ),
      },
      {
        path: "/frontdesk",
        element: (
          <RoleGate allow={["FRONTDESK"]}>
            <FrontDeskHome />
          </RoleGate>
        ),
      },
      {
        path: "/admin",
        element: (
          <RoleGate allow={["ADMIN"]}>
            <AdminHome />
          </RoleGate>
        ),
      },
    ],
  },

  { path: "*", element: <Navigate to="/" replace /> },
]);
