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
  const location = useLocation();
  const active = location.pathname === to || location.pathname.startsWith(to + "/");
  return (
    <NavLink to={to} style={{ textDecoration: "none" }}>
      <Text
        fw={active ? 700 : 500}
        style={{
          padding: "6px 10px",
          borderRadius: 8,
          background: active ? "rgba(0,0,0,0.04)" : "transparent",
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

  const commonLinks: LinkItem[] = [
    { to: "/", label: "Home" },
    { to: "/dashboard", label: "Dashboard" },
  ];

  const roleLinks = useMemo<LinkItem[]>(() => {
    if (!role) return [];
    if (role === "EMPLOYER") return [{ to: "/employer", label: "Employer" }];
    if (role === "FRONTDESK") return [{ to: "/frontdesk", label: "Front Desk" }];
    if (role === "ADMIN") return [{ to: "/admin", label: "Admin" }];
    return [];
  }, [role]);

  const next = encodeURIComponent(loc.pathname + loc.search);

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
        <Menu shadow="md" width={220} position="bottom-end">
          <Menu.Target>
            <Group gap="xs" style={{ cursor: "pointer" }}>
              <Avatar radius="xl" size={28}>{(user.name?.[0] || user.email?.[0] || "U").toUpperCase()}</Avatar>
              <Badge variant="light">{role ?? "USER"}</Badge>
            </Group>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Label>{user.name || user.email}</Menu.Label>
            <Menu.Item onClick={() => nav("/dashboard")}>Dashboard</Menu.Item>
            {role === "EMPLOYER" && <Menu.Item onClick={() => nav("/employer")}>Employer</Menu.Item>}
            {role === "FRONTDESK" && <Menu.Item onClick={() => nav("/frontdesk")}>Front Desk</Menu.Item>}
            {role === "ADMIN" && <Menu.Item onClick={() => nav("/admin")}>Admin</Menu.Item>}
            <Menu.Divider />
            <Menu.Item color="red" onClick={async () => { await signOut(); nav("/", { replace: true }); }}>
              Sign out
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      )}
    </>
  );

  return (
    <Box component="header" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)", background: "white" }}>
      <Container size="lg" style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        {/* Left: brand + links (desktop) */}
        <Group gap="md">
          <Link to="/" style={{ textDecoration: "none" }}>
            <Text fw={800} size="lg">WLP</Text>
          </Link>

          <Group gap="xs" visibleFrom="sm">
            {commonLinks.map((l) => <NavAnchor key={l.to} {...l} />)}
            {roleLinks.map((l) => <NavAnchor key={l.to} {...l} />)}
          </Group>
        </Group>

        {/* Right: actions (desktop) */}
        <Group gap="md" visibleFrom="sm">
          {RightSide}
        </Group>

        {/* Mobile burger */}
        <Burger opened={opened} onClick={() => setOpened((o) => !o)} hiddenFrom="sm" aria-label="Toggle navigation" />
      </Container>

      {/* Mobile drawer */}
      <Drawer opened={opened} onClose={() => setOpened(false)} padding="md" size="xs" title="Navigation" hiddenFrom="sm">
        <Stack gap="xs" mb="md">
          {[...commonLinks, ...roleLinks].map((l) => (
            <NavLink key={l.to} to={l.to} onClick={() => setOpened(false)} style={{ textDecoration: "none" }}>
              <Text fw={600}>{l.label}</Text>
            </NavLink>
          ))}
        </Stack>
        <Box>
          {RightSide}
        </Box>
      </Drawer>
    </Box>
  );
}
