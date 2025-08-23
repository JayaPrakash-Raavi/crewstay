import { useEffect, useState } from "react";
import { Badge, Button, Card, Group, Stack, Text, Title } from "@mantine/core";
import { api } from "../../lib/api";

type Req = { id: string; employer_id: string; stay_start: string; stay_end: string; headcount: number; status: string };

export default function FrontDeskRequests() {
  const [items, setItems] = useState<Req[]>([]);

  async function load() {
    // for demo: reuse general table; in real app create dedicated endpoint filtered by status=SUBMITTED&hotel_id=user.hotel_id
    const res = await api<{ items: Req[] }>("/api/employer/requests"); // replace later with dedicated FE endpoint
    setItems(res.items.filter((r) => r.status === "SUBMITTED"));
  }

  async function decide(id: string, decision: "ACCEPT" | "REJECT") {
    await api(`/api/frontdesk/requests/${id}/decision`, {
      method: "POST",
      body: JSON.stringify({ decision }),
    });
    load();
  }

  useEffect(() => { load(); }, []);

  return (
    <Stack gap="md">
      <Title order={2}>Pending Requests</Title>
      {items.map((r) => (
        <Card key={r.id} withBorder radius="md" p="md">
          <Group justify="space-between">
            <div>
              <Title order={4}>REQ-{r.id.slice(0,6).toUpperCase()}</Title>
              <Text c="dimmed" size="sm">Employer: {r.employer_id}</Text>
              <Text size="sm">Dates: {r.stay_start} → {r.stay_end} • Headcount: {r.headcount}</Text>
            </div>
            <Group>
              <Button color="green" onClick={() => decide(r.id, "ACCEPT")}>Accept</Button>
              <Button color="red" variant="default" onClick={() => decide(r.id, "REJECT")}>Reject</Button>
            </Group>
          </Group>
        </Card>
      ))}
      {items.length === 0 && <Text c="dimmed">No pending requests.</Text>}
    </Stack>
  );
}
