import { AppShell, NavLink as MantineNavLink, ScrollArea } from "@mantine/core";
import { Outlet, NavLink as RouterLink, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TopNav from "./TopNav"; // optional; remove if you don't use it

type LinkItem = { to: string; label: string };

export default function Shell() {
  const { role } = useAuth();
  const loc = useLocation();

  // Build sidebar items dynamically
  const items: LinkItem[] = [
    { to: "/dashboard", label: "Dashboard" },
    ...(role === "EMPLOYER" ? [{ to: "/employer", label: "Employer" }] : []),
    ...(role === "FRONTDESK" ? [{ to: "/frontdesk", label: "Front Desk" }] : []),
    ...(role === "ADMIN" ? [{ to: "/admin", label: "Admin" }] : []),
  ];

  const isActive = (to: string) =>
    loc.pathname === to || loc.pathname.startsWith(to + "/");

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: 220, breakpoint: "sm" }}
      padding="md"
    >
      {/* Top bar (optional). Remove this block if you don't want a top nav */}
      <AppShell.Header>
        <TopNav />
      </AppShell.Header>

      {/* Sidebar - role aware */}
      <AppShell.Navbar p="sm">
        <ScrollArea>
          {items.map((it) => (
            <MantineNavLink
              key={it.to}
              label={it.label}
              component={RouterLink}
              to={it.to}
              active={isActive(it.to)}
              variant="light"
            />
          ))}
        </ScrollArea>
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
