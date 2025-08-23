// src/router.tsx
import { createBrowserRouter, Navigate, Outlet } from "react-router-dom";
import Shell from "./components/Shell";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleGate from "./components/RoleGate";
import PublicOnly from "./components/PublicOnly";

// Public pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import UpdatePassword from "./pages/UpdatePassword";

// Common / authed
import Dashboard from "./pages/Dashboard";
// import Account from "./pages/Account"; // create a stub if you don't have it

// Employer
import EmployerHome from "./pages/employer/Index";
import EmployerRequestsList from "./pages/employer/requests/List";   // stub if needed
import EmployerRequestNew from "./pages/employer/requests/New";
import EmployerWorkers from "./pages/employer/Workers";              // <— the page you built
// import EmployerWorkersImport from "./pages/employer/workers/Import";  // stub if needed

// Front desk
import FrontDeskHome from "./pages/frontdesk/Index";
// import Assignments from "./pages/frontdesk/Assignments";  // stub if needed
// import CheckIn from "./pages/frontdesk/checkin/Index";     // stub if needed

// Admin
import AdminHome from "./pages/admin/Index";
import AdminUsers from "./pages/admin/Users";      // stub if needed
// import AdminReports from "./pages/admin/Reports";  // stub if needed

export const router = createBrowserRouter([
  // Public-only
  { path: "/", element: <PublicOnly><Home /></PublicOnly> },
  { path: "/login", element: <PublicOnly><Login /></PublicOnly> },
  { path: "/signup", element: <PublicOnly><Signup /></PublicOnly> },
  { path: "/forgot-password", element: <PublicOnly><ForgotPassword /></PublicOnly> },
  { path: "/update-password", element: <PublicOnly><UpdatePassword /></PublicOnly> },

  // Authed area
  {
    element: (
      <ProtectedRoute>
        <Shell />
      </ProtectedRoute>
    ),
    children: [
      { path: "/dashboard", element: <Dashboard /> },
      // { path: "/account", element: <Account /> },

      // EMPLOYER section with nested routes
      {
        path: "/employer",
        element: (
          <RoleGate allow={["EMPLOYER"]}>
            <Outlet />
          </RoleGate>
        ),
        children: [
          { index: true, element: <EmployerHome /> },                 // /employer
          { path: "requests", element: <EmployerRequestsList /> },    // /employer/requests
          { path: "requests/new", element: <EmployerRequestNew /> },  // /employer/requests/new
          { path: "workers", element: <EmployerWorkers /> },          // /employer/workers  ✅
          // { path: "workers/import", element: <EmployerWorkersImport /> },
        ],
      },

      // FRONT DESK
      {
        path: "/frontdesk",
        element: (
          <RoleGate allow={["FRONTDESK"]}>
            <Outlet />
          </RoleGate>
        ),
        children: [
          { index: true, element: <FrontDeskHome /> },
          // { path: "assignments", element: <Assignments /> },
          // { path: "checkin", element: <CheckIn /> },
        ],
      },

      // ADMIN
      {
        path: "/admin",
        element: (
          <RoleGate allow={["ADMIN"]}>
            <Outlet />
          </RoleGate>
        ),
        children: [
          { index: true, element: <AdminHome /> },
          { path: "users", element: <AdminUsers /> },
          // { path: "reports", element: <AdminReports /> },
        ],
      },
    ],
  },

  // Fallback
  { path: "*", element: <Navigate to="/dashboard" replace /> },
]);
