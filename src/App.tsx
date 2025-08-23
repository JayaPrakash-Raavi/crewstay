import { MantineProvider } from "@mantine/core";
import { RouterProvider, useLocation } from "react-router-dom";
import { router } from "./router";
import TopNav from "./components/TopNav";
import { AuthProvider } from "./context/AuthContext";

function Frame() {
  const loc = useLocation();
  const hide =
    loc.pathname.startsWith("/login") ||
    loc.pathname.startsWith("/signup") ||
    loc.pathname.startsWith("/forgot-password") ||
    loc.pathname.startsWith("/update-password");

  return (
    <>
      {!hide && <TopNav />}
      {/* your routed pages render here */}
      {/* The RouterProvider will render the current route’s element */}
    </>
  );
}

export default function App() {
  return (
    <MantineProvider defaultColorScheme="light">
      <AuthProvider>
        {/* Wrap the router with a frame that contains the navbar */}
        <RouterProvider router={router}>
          {/* Note: If your router renders directly, you can instead add <TopNav /> in Shell or layout routes */}
        </RouterProvider>
      </AuthProvider>
    </MantineProvider>
  );
}
