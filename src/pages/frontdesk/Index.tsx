import { useEffect, useState } from "react";
import { Button, Group, SimpleGrid, Table, Title, Text, Alert } from "@mantine/core";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/statcard";
import { useNavigate } from "react-router-dom";

type FD_Summary = {
  stats: { arrivalsToday: number; pendingRequests: number; inHouse: number };
  arrivals: { worker: string; eta: string; employer: string }[];
  pending: { id: string; employer: string; headcount: number; dates: string }[];
};

export default function FrontDeskHome() {
  const { user } = useAuth();
  const [data, setData] = useState<FD_Summary | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();

  useEffect(() => {
    let ok = true;
    (async () => {
      try {
        const res = await api<FD_Summary>("/api/frontdesk/summary");
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
          <Title order={2}>Front Desk Dashboard</Title>
          <Text c="dimmed" size="sm">Signed in as {user?.email}</Text>
        </div>
        <Group>
          <Button onClick={() => nav("/frontdesk/assignments")}>Open Assignments Board</Button>
          <Button variant="default" onClick={() => nav("/frontdesk/checkin")}>Check-in / Check-out</Button>
        </Group>
      </Group>

      {err && <Alert color="red" mb="md">{err}</Alert>}

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="md">
        <StatCard label="Arrivals today" value={data?.stats.arrivalsToday ?? "—"} />
        <StatCard label="Pending requests" value={data?.stats.pendingRequests ?? "—"} />
        <StatCard label="In-house" value={data?.stats.inHouse ?? "—"} />
      </SimpleGrid>

      <Title order={4} mt="md" mb="xs">Pending requests</Title>
      <Table striped withColumnBorders>
        <Table.Thead>
          <Table.Tr><Table.Th>Employer</Table.Th><Table.Th>Headcount</Table.Th><Table.Th>Dates</Table.Th></Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {(data?.pending ?? []).map((p) => (
            <Table.Tr key={p.id}>
              <Table.Td>{p.employer}</Table.Td>
              <Table.Td>{p.headcount}</Table.Td>
              <Table.Td>{p.dates}</Table.Td>
            </Table.Tr>
          ))}
          {!data?.pending?.length && <Table.Tr><Table.Td colSpan={3}><Text c="dimmed">No pending requests.</Text></Table.Td></Table.Tr>}
        </Table.Tbody>
      </Table>

      <Title order={4} mt="lg" mb="xs">Today’s arrivals</Title>
      <Table striped withColumnBorders>
        <Table.Thead>
          <Table.Tr><Table.Th>Worker</Table.Th><Table.Th>ETA</Table.Th><Table.Th>Employer</Table.Th></Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {(data?.arrivals ?? []).map((a, i) => (
            <Table.Tr key={i}><Table.Td>{a.worker}</Table.Td><Table.Td>{a.eta}</Table.Td><Table.Td>{a.employer}</Table.Td></Table.Tr>
          ))}
          {!data?.arrivals?.length && <Table.Tr><Table.Td colSpan={3}><Text c="dimmed">No arrivals today.</Text></Table.Td></Table.Tr>}
        </Table.Tbody>
      </Table>
    </div>
  );
}
