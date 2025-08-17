import { useEffect, useState } from "react";
import { Button, Card, Container, Group, Table, Text, Title, Badge } from "@mantine/core";
import { Link, useNavigate } from "react-router-dom";

type RequestRow = {
  id: string;
  hotel_id: string;
  stay_start: string;
  stay_end: string;
  headcount: number;
  room_type_mix: { SINGLE?: number; DOUBLE?: number };
  status: string;
  created_at: string;
};

export default function EmployerRequestsList() {
  const [rows, setRows] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const nav = useNavigate();

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/room-requests", { credentials: "include" });
      const data = await res.json();
      setRows(data.requests || []);
      setLoading(false);
    })();
  }, []);

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="sm">
        <div>
          <Title order={3}>My Room Requests</Title>
          <Text c="dimmed" size="sm">All requests you’ve submitted</Text>
        </div>
        <Button onClick={() => nav("/employer/requests/new")}>Create Request</Button>
      </Group>

      <Card withBorder padding="lg" radius="md">
        {loading ? (
          <Text>Loading…</Text>
        ) : rows.length === 0 ? (
          <Text c="dimmed">No requests yet.</Text>
        ) : (
          <Table highlightOnHover verticalSpacing="sm">
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Created</Table.Th>
                <Table.Th>Stay</Table.Th>
                <Table.Th>Headcount</Table.Th>
                <Table.Th>Mix</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.map((r) => (
                <Table.Tr key={r.id}>
                  <Table.Td>{new Date(r.created_at).toLocaleDateString()}</Table.Td>
                  <Table.Td>
                    {r.stay_start} → {r.stay_end}
                  </Table.Td>
                  <Table.Td>{r.headcount}</Table.Td>
                  <Table.Td>
                    {(r.room_type_mix?.SINGLE ?? 0)}×Single, {(r.room_type_mix?.DOUBLE ?? 0)}×Double
                  </Table.Td>
                  <Table.Td>
                    <Badge variant="light">{r.status}</Badge>
                  </Table.Td>
                  <Table.Td>
                    <Button
                      variant="default"
                      size="xs"
                      component={Link}
                      to={`/employer/requests/${r.id}`}
                    >
                      View
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}
      </Card>
    </Container>
  );
}
