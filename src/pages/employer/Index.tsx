import { useEffect, useState } from "react";
import { Button, Group, SimpleGrid, Table, Title, Text, Alert } from "@mantine/core";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/statcard";
import { useNavigate } from "react-router-dom";

type EmployerSummary = {
  stats: { activeRequests: number; workersInHouse: number; extensionsDue: number };
  arrivals: { worker: string; date: string; hotel: string }[];
  requests: { id: string; hotel: string; stay_start: string; stay_end: string; headcount: number; status: string }[];
};

export default function EmployerHome() {
  const { user } = useAuth();
  const [data, setData] = useState<EmployerSummary | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    let ok = true;
    (async () => {
      try {
        const res = await api<EmployerSummary>("/api/employer/summary");
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
          <Title order={2}>Employer Dashboard</Title>
          <Text c="dimmed" size="sm">Welcome {user?.email}</Text>
        </div>
        <Group>
          <Button onClick={() => nav("/employer/requests/new")}>Create Room Request</Button>
          <Button variant="default" onClick={() => nav("/employer/workers/import")}>Import Workers (CSV)</Button>
        </Group>
      </Group>

      {err && <Alert color="red" mb="md">{err}</Alert>}

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="md">
        <StatCard label="Active requests" value={data?.stats.activeRequests ?? "—"} />
        <StatCard label="Workers in-house" value={data?.stats.workersInHouse ?? "—"} />
        <StatCard label="Extensions due" value={data?.stats.extensionsDue ?? "—"} />
      </SimpleGrid>

      <Title order={4} mt="md" mb="xs">Upcoming arrivals</Title>
      <Table striped highlightOnHover withColumnBorders stickyHeader>
        <Table.Thead>
          <Table.Tr><Table.Th>Worker</Table.Th><Table.Th>Date</Table.Th><Table.Th>Hotel</Table.Th></Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {(data?.arrivals ?? []).map((a, i) => (
            <Table.Tr key={i}><Table.Td>{a.worker}</Table.Td><Table.Td>{a.date}</Table.Td><Table.Td>{a.hotel}</Table.Td></Table.Tr>
          ))}
          {!data?.arrivals?.length && <Table.Tr><Table.Td colSpan={3}><Text c="dimmed">No arrivals scheduled.</Text></Table.Td></Table.Tr>}
        </Table.Tbody>
      </Table>

      <Title order={4} mt="lg" mb="xs">My active requests</Title>
      <Table striped withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Hotel</Table.Th><Table.Th>Dates</Table.Th><Table.Th>Headcount</Table.Th><Table.Th>Status</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {(data?.requests ?? []).map((r) => (
            <Table.Tr key={r.id}>
              <Table.Td>{r.hotel}</Table.Td>
              <Table.Td>{r.stay_start} → {r.stay_end}</Table.Td>
              <Table.Td>{r.headcount}</Table.Td>
              <Table.Td>{r.status}</Table.Td>
            </Table.Tr>
          ))}
          {!data?.requests?.length && <Table.Tr><Table.Td colSpan={4}><Text c="dimmed">No active requests.</Text></Table.Td></Table.Tr>}
        </Table.Tbody>
      </Table>
    </div>
  );
}
