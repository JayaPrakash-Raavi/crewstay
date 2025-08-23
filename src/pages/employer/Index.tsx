import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Group,
  Loader,
  SimpleGrid,
  Table,
  Text,
  Title,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { api } from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import StatCard from "../../components/statcard";

type EmployerStats = {
  activeRequests: number;
  workersInHouse: number;
  extensionsDue: number;
};

type ArrivalRow = {
  worker: string;
  date: string; // YYYY-MM-DD or ISO date string
  hotel: string; // hotel name
};

type RequestRow = {
  id: string;
  hotel: string; // hotel name (server can join hotels)
  stay_start: string; // YYYY-MM-DD
  stay_end: string;   // YYYY-MM-DD
  headcount: number;
  status: "DRAFT" | "SUBMITTED" | "ACCEPTED" | "REJECTED" | "ASSIGNED" | "CHECKED_IN" | "CHECKED_OUT" | "CLOSED";
};

type EmployerSummary = {
  stats: EmployerStats;
  arrivals: ArrivalRow[];
  requests: RequestRow[];
};

function fmtDate(d: string) {
  const dt = new Date(d);
  if (Number.isNaN(dt.getTime())) return d;
  return dt.toLocaleDateString();
}

function statusColor(s: RequestRow["status"]): string {
  switch (s) {
    case "SUBMITTED": return "blue";
    case "ACCEPTED": return "green";
    case "ASSIGNED": return "grape";
    case "CHECKED_IN": return "teal";
    case "CHECKED_OUT": return "gray";
    case "REJECTED": return "red";
    case "CLOSED": return "gray";
    case "DRAFT": return "yellow";
    default: return "gray";
  }
}

export default function EmployerHome() {
  const { user } = useAuth();
  const nav = useNavigate();

  const [data, setData] = useState<EmployerSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [err, setErr] = useState<string | null>(null);

  async function load() {
    setErr(null);
    setLoading(true);
    try {
      const res = await api<EmployerSummary>("/api/employer/summary");
      setData(res);
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await api<EmployerSummary>("/api/employer/summary");
        if (alive) setData(res);
      } catch (e: any) {
        if (alive) setErr(e?.message || "Failed to load");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  return (
    <div>
      <Group justify="space-between" mb="sm">
        <div>
          <Title order={2}>Employer Dashboard</Title>
          <Text c="dimmed" size="sm">Welcome {user?.email}</Text>
        </div>
        <Group>
          <Button onClick={() => nav("/employer/requests/new")}>
            Create Room Request
          </Button>
          <Button variant="default" onClick={() => nav("/employer/requests")}>
            View Requests
          </Button>
          <Button variant="default" onClick={() => nav("/employer/workers/import")}>
            Import Workers (CSV)
          </Button>
        </Group>
      </Group>

      {err && (
        <Alert color="red" mb="md">
          {err}{" "}
          <Button size="xs" variant="white" onClick={load} ml="sm">
            Retry
          </Button>
        </Alert>
      )}

      {loading ? (
        <Group justify="center" my="lg">
          <Loader />
        </Group>
      ) : (
        <>
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" mb="md">
            <StatCard label="Active requests" value={data?.stats.activeRequests ?? "—"} />
            <StatCard label="Workers in-house" value={data?.stats.workersInHouse ?? "—"} />
            <StatCard label="Extensions due" value={data?.stats.extensionsDue ?? "—"} />
          </SimpleGrid>

          <Title order={4} mt="md" mb="xs">
            Upcoming arrivals
          </Title>
          <Table striped highlightOnHover withColumnBorders stickyHeader>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Worker</Table.Th>
                <Table.Th>Date</Table.Th>
                <Table.Th>Hotel</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {(data?.arrivals ?? []).map((a, i) => (
                <Table.Tr key={`${a.worker}-${a.date}-${i}`}>
                  <Table.Td>{a.worker}</Table.Td>
                  <Table.Td>{fmtDate(a.date)}</Table.Td>
                  <Table.Td>{a.hotel}</Table.Td>
                </Table.Tr>
              ))}
              {!data?.arrivals?.length && (
                <Table.Tr>
                  <Table.Td colSpan={3}>
                    <Text c="dimmed">No arrivals scheduled.</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>

          <Title order={4} mt="lg" mb="xs">
            My active requests
          </Title>
          <Table striped withColumnBorders highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Hotel</Table.Th>
                <Table.Th>Dates</Table.Th>
                <Table.Th>Headcount</Table.Th>
                <Table.Th>Status</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {(data?.requests ?? []).map((r) => (
                <Table.Tr key={r.id} style={{ cursor: "pointer" }} onClick={() => nav(`/employer/requests`)}>
                  <Table.Td>{r.hotel}</Table.Td>
                  <Table.Td>
                    {fmtDate(r.stay_start)} → {fmtDate(r.stay_end)}
                  </Table.Td>
                  <Table.Td>{r.headcount}</Table.Td>
                  <Table.Td>
                    <Badge variant="light" color={statusColor(r.status)}>
                      {r.status}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
              {!data?.requests?.length && (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Text c="dimmed">No active requests.</Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </>
      )}
    </div>
  );
}
