import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Alert, Badge, Button, Card, Container, Group, Stack, Text, Title } from "@mantine/core";

type RequestDetails = {
  id: string;
  hotel_name: string;
  stay_start: string;
  stay_end: string;
  headcount: number;
  room_type_mix: { SINGLE?: number; DOUBLE?: number };
  notes?: string | null;
  status: string;
  created_at: string;
};

export default function EmployerRequestDetails() {
  const { id } = useParams();
  const nav = useNavigate();
  const [data, setData] = useState<RequestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch(`/api/room-requests/${id}`, { credentials: "include" });
      const json = await res.json();
      if (!res.ok) setErr(json.error || "Failed to load");
      else setData(json.request);
      setLoading(false);
    })();
  }, [id]);

  const cancel = async () => {
    if (!id) return;
    setErr(null); setOk(null);
    const res = await fetch(`/api/room-requests/${id}/cancel`, {
      method: "PATCH",
      credentials: "include",
    });
    const json = await res.json();
    if (!res.ok) setErr(json.error || "Cancel failed");
    else {
      setOk("Request canceled.");
      // refresh
      const r = await fetch(`/api/room-requests/${id}`, { credentials: "include" });
      const j = await r.json();
      if (r.ok) setData(j.request);
    }
  };

  if (loading) return <Container><Text>Loading…</Text></Container>;

  if (!data) return (
    <Container>
      {err && <Alert color="red" mb="sm">{err}</Alert>}
      <Button component={Link} to="/employer/requests">Back</Button>
    </Container>
  );

  return (
    <Container size="md" py="xl">
      <Group justify="space-between" mb="sm">
        <Title order={3}>Request Details</Title>
        <Button component={Link} to="/employer/requests" variant="default">Back to list</Button>
      </Group>
      {err && <Alert color="red" mb="sm">{err}</Alert>}
      {ok && <Alert color="green" mb="sm">{ok}</Alert>}

      <Card withBorder padding="lg" radius="md">
        <Stack gap="xs">
          <Group>
            <Text fw={600}>Hotel:</Text><Text>{data.hotel_name}</Text>
          </Group>
          <Group>
            <Text fw={600}>Stay:</Text><Text>{data.stay_start} → {data.stay_end}</Text>
          </Group>
          <Group>
            <Text fw={600}>Headcount:</Text><Text>{data.headcount}</Text>
          </Group>
          <Group>
            <Text fw={600}>Room mix:</Text>
            <Text>{(data.room_type_mix?.SINGLE ?? 0)}×Single, {(data.room_type_mix?.DOUBLE ?? 0)}×Double</Text>
          </Group>
          <Group>
            <Text fw={600}>Status:</Text><Badge variant="light">{data.status}</Badge>
          </Group>
          {data.notes && (
            <div>
              <Text fw={600} mb={4}>Notes</Text>
              <Text c="dimmed">{data.notes}</Text>
            </div>
          )}
        </Stack>

        {data.status === "SUBMITTED" && (
          <Group justify="flex-end" mt="md">
            <Button color="red" onClick={cancel}>Cancel request</Button>
          </Group>
        )}
      </Card>
    </Container>
  );
}
