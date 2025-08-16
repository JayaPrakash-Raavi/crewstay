import { AppShell, Burger, Group, NavLink, Title } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { Outlet, NavLink as RRLink, useLocation } from "react-router-dom";

export default function Shell() {
  const [opened, { toggle }] = useDisclosure();
  const loc = useLocation();

  return (
    <AppShell
      header={{ height: 56 }}
      navbar={{ width: 240, breakpoint: "sm", collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            <Title order={4}>Worker Lodging Platform</Title>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="sm">
        <NavLink
          component={RRLink} to="/dashboard" label="Dashboard"
          active={loc.pathname === "/dashboard"}
        />
        <NavLink
          component={RRLink} to="/employer" label="Employer"
          active={loc.pathname === "/employer"}
        />
        <NavLink
          component={RRLink} to="/frontdesk" label="Front Desk"
          active={loc.pathname === "/frontdesk"}
        />
        <NavLink
          component={RRLink} to="/admin" label="Admin"
          active={loc.pathname === "/admin"}
        />
      </AppShell.Navbar>

      <AppShell.Main><Outlet /></AppShell.Main>
    </AppShell>
  );
}
