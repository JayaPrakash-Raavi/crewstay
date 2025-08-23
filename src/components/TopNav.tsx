import { useMemo, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Burger,
  Container,
  Drawer,
  Group,
  Menu,
  Stack,
  Text,
} from "@mantine/core";
import { useAuth } from "../context/AuthContext";

type LinkItem = { to: string; label: string };

function NavAnchor({ to, label }: LinkItem) {
  const { pathname } = useLocation();
  const active = pathname === to || pathname.startsWith(to + "/");
  return (
    <NavLink to={to} style={{ textDecoration: "none" }}>
      <Text
        fw={active ? 700 : 500}
        style={{
          padding: "6px 10px",
          borderRadius: 8,
          background: active ? "rgba(0,0,0,0.05)" : "transparent",
        }}
      >
        {label}
      </Text>
    </NavLink>
  );
}

export default function TopNav() {
  const { user, role, signOut } = useAuth();
  const [opened, setOpened] = useState(false);
  const nav = useNavigate();
  const loc = useLocation();
  const next = encodeURIComponent(loc.pathname + loc.search);

  // Global links that everyone can see
  const commonLinks: LinkItem[] = [
    { to: "/", label: "Home" },
    // { to: "/dashboard", label: "Dashboard" },
  ];

  // Role-specific section links
  const roleSectionLinks = useMemo<LinkItem[]>(() => {
    switch (role) {
      case "EMPLOYER":
        return [
          { to: "/employer", label: "Employer" },
          { to: "/employer/requests", label: "Requests" },
          { to: "/employer/workers", label: "Workers" },
          { to: "/account", label: "Account" },
        ];
      case "FRONTDESK":
        return [
          { to: "/frontdesk", label: "Front Desk" },
          { to: "/frontdesk/assignments", label: "Assignments" },
          { to: "/frontdesk/checkin", label: "Check-in" },
          { to: "/account", label: "Account" },
        ];
      case "ADMIN":
        return [
          { to: "/admin", label: "Admin" },
          { to: "/admin/users", label: "Users" },
          { to: "/admin/reports", label: "Reports" },
          { to: "/account", label: "Account" },
        ];
      default:
        return [];
    }
  }, [role]);

  const RightSide = (
    <>
      {!user ? (
        <Group gap="xs">
          <Button size="xs" onClick={() => nav(`/login?next=${next}`)}>
            Sign in
          </Button>
          <Button size="xs" variant="default" onClick={() => nav(`/signup?next=${next}`)}>
            Create account
          </Button>
        </Group>
      ) : (
        <Menu shadow="md" width={240} position="bottom-end">
          <Menu.Target>
            <Group gap="xs" style={{ cursor: "pointer" }}>
              <Avatar radius="xl" size={28}>
                {(user.name?.[0] || user.email?.[0] || "U").toUpperCase()}
              </Avatar>
              <Badge variant="light">{role ?? "USER"}</Badge>
            </Group>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>{user.name || user.email}</Menu.Label>
            {/* <Menu.Item onClick={() => nav("/dashboard")}>Dashboard</Menu.Item> */}
            {role === "EMPLOYER" && (
              <>
                <Menu.Item onClick={() => nav("/employer")}>Employer Home</Menu.Item>
                <Menu.Item onClick={() => nav("/employer/requests")}>Requests</Menu.Item>
                <Menu.Item onClick={() => nav("/employer/workers")}>Workers</Menu.Item>
              </>
            )}
            {role === "FRONTDESK" && (
              <>
                <Menu.Item onClick={() => nav("/frontdesk")}>Front Desk Home</Menu.Item>
                <Menu.Item onClick={() => nav("/frontdesk/assignments")}>Assignments</Menu.Item>
                <Menu.Item onClick={() => nav("/frontdesk/checkin")}>Check-in</Menu.Item>
              </>
            )}
            {role === "ADMIN" && (
              <>
                <Menu.Item onClick={() => nav("/admin")}>Admin Home</Menu.Item>
                <Menu.Item onClick={() => nav("/admin/users")}>Users</Menu.Item>
                <Menu.Item onClick={() => nav("/admin/reports")}>Reports</Menu.Item>
              </>
            )}
            <Menu.Item onClick={() => nav("/account")}>Account</Menu.Item>
            <Menu.Divider />
            <Menu.Item
              color="red"
              onClick={async () => {
                await signOut();
                nav("/", { replace: true });
              }}
            >
              Sign out
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      )}
    </>
  );

  // Optional: quick action for employer
  const QuickAction =
    role === "EMPLOYER" && user ? (
      <Button size="xs" variant="filled" onClick={() => nav("/employer/requests/new")}>
        + New Request
      </Button>
    ) : null;

  return (
    <Box
      component="header"
      style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: "white" }}
    >
      <Container
        size="lg"
        style={{
          height: 56,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        {/* Left: brand + links (desktop) */}
        <Group gap="md">
          <Link to="/" style={{ textDecoration: "none" }}>
            <Text fw={800} size="lg">
              WLP
            </Text>
          </Link>

          {/* primary links */}
          <Group gap="xs" visibleFrom="sm">
            {commonLinks.map((l) => (
              <NavAnchor key={l.to} {...l} />
            ))}
            {roleSectionLinks.map((l) => (
              <NavAnchor key={l.to} {...l} />
            ))}
          </Group>
        </Group>

        {/* Right: actions (desktop) */}
        <Group gap="md" visibleFrom="sm">
          {QuickAction}
          {RightSide}
        </Group>

        {/* Mobile burger */}
        <Burger
          opened={opened}
          onClick={() => setOpened((o) => !o)}
          hiddenFrom="sm"
          aria-label="Toggle navigation"
        />
      </Container>

      {/* Mobile drawer */}
      <Drawer
        opened={opened}
        onClose={() => setOpened(false)}
        padding="md"
        size="xs"
        title="Navigation"
        hiddenFrom="sm"
      >
        <Stack gap="xs" mb="md">
          {[...commonLinks, ...roleSectionLinks].map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              onClick={() => setOpened(false)}
              style={{ textDecoration: "none" }}
            >
              <Text fw={600}>{l.label}</Text>
            </NavLink>
          ))}
        </Stack>
        <Group justify="space-between">
          {QuickAction}
          {RightSide}
        </Group>
      </Drawer>
    </Box>
  );
}
