import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Modal,
  Select,
  SimpleGrid,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { api } from "../../lib/api";
import Papa from "papaparse";
type BucketHotel = { id: string; name: string; count: number };
type WorkerRow = {
  id: string;
  name: string;
  phone: string | null;
  status: "Unassigned" | "In-house" | "Upcoming" | "Checked-out";
  hotel: string | null;
  room_no: string | null;
  checkin_ts: string | null;
  checkout_ts: string | null;
  gov_id_type: string | null;
  gov_id_last4: string | null;
  notes: string | null;
};

type WorkersResponse = {
  hotels: BucketHotel[];
  buckets: {
    byHotel: BucketHotel[];
    unassigned: number;
    upcoming: number;
    checkedOut30d: number;
  };
  workers: WorkerRow[];
};

function statusColor(s: WorkerRow["status"]) {
  switch (s) {
    case "In-house": return "teal";
    case "Upcoming": return "blue";
    case "Checked-out": return "gray";
    default: return "gray";
  }
}
function fmt(d?: string | null) {
  if (!d) return "—";
  const t = new Date(d);
  return isNaN(t.getTime()) ? d : t.toLocaleDateString();
}

export default function EmployerWorkers() {
  const [data, setData] = useState<WorkersResponse | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // filters
  const [q, setQ] = useState("");
  const [hotelId, setHotelId] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  // add worker modal
  const [openAdd, setOpenAdd] = useState(false);
  const [wName, setWName] = useState("");
  const [wPhone, setWPhone] = useState("");
  const [wGovType, setWGovType] = useState("");
  const [wGovLast4, setWGovLast4] = useState("");
  const [wNotes, setWNotes] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    setErr(null);
    try {
      const qs = new URLSearchParams();
      if (q) qs.set("q", q);
      if (hotelId) qs.set("hotel_id", hotelId);
      if (status) qs.set("status", status);
      if (start) qs.set("start", start);
      if (end) qs.set("end", end);
      const res = await api<WorkersResponse>(`/api/employer/workers?${qs.toString()}`);
      setData(res);
    } catch (e: any) {
      setErr(e?.message || "Failed to load workers");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [q, hotelId, status, start, end]);

  const allHotels = useMemo(
    () => (data?.hotels || []).map(h => ({ value: h.id, label: `${h.name} (${h.count})` })),
    [data?.hotels]
  );

  async function addWorker() {
    if (!wName.trim()) return;
    try {
      await api("/api/employer/workers/bulk", {
        method: "POST",
        body: JSON.stringify({
          workers: [{ name: wName.trim(), phone: wPhone || null, gov_id_type: wGovType || null, gov_id_last4: wGovLast4 || null, notes: wNotes || null }],
        }),
      });
      setOpenAdd(false);
      setWName(""); setWPhone(""); setWNotes(""); setWGovType(""); setWGovLast4("");
      await load();
    } catch (e: any) {
      setErr(e?.message || "Failed to add worker");
    }
  }

  function triggerCSV() {
    fileRef.current?.click();
  }
  function onCSV(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (res:any) => {
        const rows = (res.data as any[]).map((r) => ({
          name: String(r.name || r.Name || "").trim(),
          phone: r.phone || r.Phone || null,
          notes: r.notes || r.Notes || null,
          gov_id_type: r.gov_id_type || r["Gov ID Type"] || null,
          gov_id_last4: r.gov_id_last4 || r["Gov ID Last4"] || null,
        })).filter(r => r.name);
        if (rows.length === 0) return;
        try {
          await api("/api/employer/workers/bulk", {
            method: "POST",
            body: JSON.stringify({ workers: rows }),
          });
          await load();
        } catch (e: any) {
          setErr(e?.message || "CSV import failed");
        } finally {
          e.target.value = "";
        }
      },
      error: (err:any) => {
        setErr(err.message || "Failed to parse CSV");
        e.target.value = "";
      },
    });
  }

  function exportCSV() {
    const rows = (data?.workers || []).map((w) => ({
      name: w.name,
      phone: w.phone || "",
      status: w.status,
      hotel: w.hotel || "",
      room_no: w.room_no || "",
      checkin: w.checkin_ts ? fmt(w.checkin_ts) : "",
      checkout: w.checkout_ts ? fmt(w.checkout_ts) : "",
      gov_id_type: w.gov_id_type || "",
      gov_id_last4: w.gov_id_last4 || "",
      notes: w.notes || "",
    }));
    const csv = Papa.unparse(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "workers.csv";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <Group justify="space-between" mb="sm">
        <Title order={2}>Workers</Title>
        <Group>
          <Button onClick={() => setOpenAdd(true)}>Add Worker</Button>
          <Button variant="default" onClick={triggerCSV}>Import CSV</Button>
          <input ref={fileRef} type="file" accept=".csv" onChange={onCSV} style={{ display: "none" }} />
          <Button variant="default" onClick={exportCSV}>Export CSV</Button>
        </Group>
      </Group>

      {err && <Alert color="red" mb="md">{err}</Alert>}

      {/* Buckets */}
      <SimpleGrid cols={{ base: 2, md: 6 }} spacing="sm" mb="md">
        {(data?.hotels || []).map(h => (
          <Card key={h.id} withBorder padding="sm" onClick={() => setHotelId(h.id)} style={{ cursor: "pointer" }}>
            <Group justify="space-between">
              <Text fw={500}>{h.name}</Text>
              <Badge>{h.count}</Badge>
            </Group>
          </Card>
        ))}
        <Card withBorder padding="sm">
          <Group justify="space-between">
            <Text fw={500}>Unassigned</Text>
            <Badge>{data?.buckets.unassigned ?? 0}</Badge>
          </Group>
        </Card>
        <Card withBorder padding="sm">
          <Group justify="space-between">
            <Text fw={500}>Upcoming</Text>
            <Badge>{data?.buckets.upcoming ?? 0}</Badge>
          </Group>
        </Card>
        <Card withBorder padding="sm">
          <Group justify="space-between">
            <Text fw={500}>Checked-out (30d)</Text>
            <Badge>{data?.buckets.checkedOut30d ?? 0}</Badge>
          </Group>
        </Card>
      </SimpleGrid>

      {/* Filters */}
      <Group wrap="wrap" gap="sm" mb="sm">
        <TextInput placeholder="Name or phone" value={q} onChange={(e) => setQ(e.currentTarget.value)} />
        <Select placeholder="All Hotels" data={[{ value: "", label: "All Hotels" }, ...allHotels]}
                value={hotelId || ""} onChange={(v) => setHotelId(v || null)} style={{ minWidth: 220 }} />
        <Select
          placeholder="Status"
          data={["Unassigned", "In-house", "Upcoming", "Checked-out"].map(s => ({ value: s, label: s }))}
          value={status || undefined}
          onChange={(v) => setStatus(v || null)}
          allowDeselect
          style={{ minWidth: 160 }}
        />
        <Group gap="xs">
          <Text size="sm" c="dimmed">Check-in range:</Text>
          <TextInput type="date" value={start} onChange={(e) => setStart(e.currentTarget.value)} />
          <TextInput type="date" value={end} onChange={(e) => setEnd(e.currentTarget.value)} />
        </Group>
        <Button variant="subtle" onClick={() => { setQ(""); setHotelId(null); setStatus(null); setStart(""); setEnd(""); }}>
          Clear
        </Button>
      </Group>

      {/* Table */}
      <Table striped highlightOnHover withColumnBorders stickyHeader>
        <Table.Thead>
          <Table.Tr>
            <Table.Th style={{ minWidth: 220 }}>Name</Table.Th>
            <Table.Th>Phone (E.164)</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th>Hotel</Table.Th>
            <Table.Th>Room</Table.Th>
            <Table.Th>Check-in</Table.Th>
            <Table.Th>Check-out</Table.Th>
            <Table.Th>Gov ID Type</Table.Th>
            <Table.Th>Gov ID Last 4</Table.Th>
            <Table.Th>Notes</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {(data?.workers || []).map((w) => (
            <Table.Tr key={w.id}>
              <Table.Td>{w.name}</Table.Td>
              <Table.Td>{w.phone || "—"}</Table.Td>
              <Table.Td><Badge variant="light" color={statusColor(w.status)}>{w.status}</Badge></Table.Td>
              <Table.Td>{w.hotel || "—"}</Table.Td>
              <Table.Td>{w.room_no || "—"}</Table.Td>
              <Table.Td>{fmt(w.checkin_ts)}</Table.Td>
              <Table.Td>{fmt(w.checkout_ts)}</Table.Td>
              <Table.Td>{w.gov_id_type || "—"}</Table.Td>
              <Table.Td>{w.gov_id_last4 || "—"}</Table.Td>
              <Table.Td>{w.notes || "—"}</Table.Td>
            </Table.Tr>
          ))}
          {!loading && !(data?.workers?.length) && (
            <Table.Tr><Table.Td colSpan={10}><Text c="dimmed">No workers.</Text></Table.Td></Table.Tr>
          )}
        </Table.Tbody>
      </Table>

      {/* Add worker modal */}
      <Modal opened={openAdd} onClose={() => setOpenAdd(false)} title="Add Worker" centered>
        <SimpleGrid cols={{ base: 1, sm: 2 }}>
          <TextInput label="Name" value={wName} onChange={(e) => setWName(e.currentTarget.value)} required />
          <TextInput label="Phone (E.164)" placeholder="+15551234567" value={wPhone} onChange={(e) => setWPhone(e.currentTarget.value)} />
          <TextInput label="Gov ID Type" value={wGovType} onChange={(e) => setWGovType(e.currentTarget.value)} />
          <TextInput label="Gov ID Last 4" value={wGovLast4} onChange={(e) => setWGovLast4(e.currentTarget.value)} />
        </SimpleGrid>
        <Divider my="sm" />
        <TextInput label="Notes" value={wNotes} onChange={(e) => setWNotes(e.currentTarget.value)} />
        <Group justify="end" mt="md">
          <Button onClick={addWorker}>Save</Button>
          <Button variant="default" onClick={() => setOpenAdd(false)}>Cancel</Button>
        </Group>
      </Modal>
    </div>
  );
}
