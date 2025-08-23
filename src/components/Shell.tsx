// src/components/Shell.tsx
import { AppShell } from "@mantine/core";
import { Outlet } from "react-router-dom";
import TopNav from "./TopNav";

export default function Shell() {
  return (
    <AppShell
      header={{ height: 56 }}
      padding="md"
      // no navbar prop => no sidebar
    >
      <AppShell.Header>
        <TopNav />
      </AppShell.Header>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>
    </AppShell>
  );
}
