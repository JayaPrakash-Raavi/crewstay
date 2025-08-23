import { useEffect, useState } from "react";
import { Button, Group, SimpleGrid, Table, Title, Text, Alert, Progress, Paper, Stack } from "@mantine/core";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/statcard";
import { useNavigate } from "react-router-dom";

type AdminSummary = {
  stats: { users: number; hotels: number; occupancyPct: number };
  recentEvents: { ts: string; actor?: string; action: string; object: string }[];
};

export default function AdminHome() {
  const { user } = useAuth();
  const [data, setData] = useState<AdminSummary | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    let ok = true;
    (async () => {
      try {
        const res = await api<AdminSummary>("/api/admin/summary");
        if (ok) setData(res);
      } catch (e: any) {
        if (ok) setErr(e?.message || "Failed to load");
      }
    })();
    return () => { ok = false; };
  }, []);

  return (
    <div>
      <Group justify="space-between" mb="sm">
        <div>
          <Title order={2}>Admin Dashboard</Title>
          <Text c="dimmed" size="sm">Signed in as {user?.email}</Text>
        </div>
        <Group>
          <Button onClick={() => nav("/admin/users")}>Manage Users & Roles</Button>
          <Button variant="default" onClick={() => nav("/admin/reports")}>Reports & Exports</Button>
        </Group>
      </Group>

      {err && <Alert color="red" mb="md">{err}</Alert>}

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="md">
        <StatCard label="Users" value={data?.stats.users ?? "—"} />
        <StatCard label="Hotels" value={data?.stats.hotels ?? "—"} />
        <Paper withBorder radius="md" p="md">
          <Text c="dimmed" size="sm">Occupancy</Text>
          <Stack gap={6} mt={6}>
            <Progress value={data?.stats.occupancyPct ?? 0} />
            <Text size="sm">{data?.stats.occupancyPct ?? 0}%</Text>
          </Stack>
        </Paper>
      </SimpleGrid>

      <Title order={4} mt="md" mb="xs">Recent activity</Title>
      <Table striped withColumnBorders>
        <Table.Thead>
          <Table.Tr><Table.Th>Time</Table.Th><Table.Th>Actor</Table.Th><Table.Th>Action</Table.Th><Table.Th>Object</Table.Th></Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {(data?.recentEvents ?? []).map((e, i) => (
            <Table.Tr key={i}>
              <Table.Td>{e.ts}</Table.Td>
              <Table.Td>{e.actor || "—"}</Table.Td>
              <Table.Td>{e.action}</Table.Td>
              <Table.Td>{e.object}</Table.Td>
            </Table.Tr>
          ))}
          {!data?.recentEvents?.length && <Table.Tr><Table.Td colSpan={4}><Text c="dimmed">No recent events.</Text></Table.Td></Table.Tr>}
        </Table.Tbody>
      </Table>
    </div>
  );
}
