import { useEffect, useState } from "react";
import { Badge, Button, Card, Group, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import { api } from "../../../lib/api";
import { useNavigate } from "react-router-dom";

type Req = { id: string; hotel_id: string; stay_start: string; stay_end: string; headcount: number; status: string; notes?: string };

export default function EmployerRequestsList() {
  const nav = useNavigate();
  const [items, setItems] = useState<Req[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ok = true;
    (async () => {
      try {
        const res = await api<{ items: Req[] }>("/api/employer/requests");
        if (ok) setItems(res.items);
      } finally { if (ok) setLoading(false); }
    })();
    return () => { ok = false; };
  }, []);

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <Title order={2}>My Requests</Title>
        <Button onClick={() => nav("/employer/requests/new")}>New request</Button>
      </Group>

      {items.map((r) => (
        <Card key={r.id} withBorder radius="md" p="md">
          <Group justify="space-between">
            <div>
              <Title order={4}>REQ-{r.id.slice(0, 6).toUpperCase()}</Title>
              <Text c="dimmed" size="sm">Hotel: {r.hotel_id}</Text>
            </div>
            <Badge variant="light">{r.status}</Badge>
          </Group>
          <SimpleGrid cols={{ base: 1, sm: 3 }} mt="sm">
            <Text>Dates: {r.stay_start} → {r.stay_end}</Text>
            <Text>Workers: {r.headcount}</Text>
            <Text>{r.notes || "\u00A0"}</Text>
          </SimpleGrid>
        </Card>
      ))}

      {!loading && items.length === 0 && <Text c="dimmed">No requests yet.</Text>}
    </Stack>
  );
}
