import { useEffect, useState } from "react";
import {
  Button,
  Card,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
  Loader,
  Alert,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { api } from "../../../lib/api";

type HotelOption = { value: string; label: string };

export default function EmployerRequestNew() {
  const nav = useNavigate();

  // Hotels state
  const [hotels, setHotels] = useState<HotelOption[]>([]);
  const [hotelsLoading, setHotelsLoading] = useState(false);
  const [hotelsErr, setHotelsErr] = useState<string | null>(null);

  // Form state
  const [hotelId, setHotelId] = useState<string | null>(null);
  const [startStr, setStartStr] = useState("");
  const [endStr, setEndStr] = useState("");
  const [headcount, setHeadcount] = useState<number>(1);
  const [single, setSingle] = useState<number>(0);
  const [double, setDouble] = useState<number>(0);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Load hotels
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setHotelsErr(null);
        setHotelsLoading(true);
        const res = await api<{ items: { id: string; name: string }[] }>(
          "/api/hotels"
        );
        const opts = (res.items || []).map((h) => ({
          value: h.id,
          label: h.name,
        }));
        if (!alive) return;
        setHotels(opts);
        // auto-select if only one hotel
        if (opts.length === 1) setHotelId(opts[0].value);
      } catch (e: any) {
        if (!alive) return;
        setHotelsErr(e?.message || "Failed to load hotels");
      } finally {
        if (alive) setHotelsLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  function isUuid(v: string) {
    return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      v
    );
  }

  async function submit() {
    setErr(null);
    if (!hotelId || !isUuid(hotelId)) return setErr("Choose a valid hotel.");
    if (!startStr || !endStr) return setErr("Pick start and end dates.");
    if (endStr <= startStr) return setErr("End must be after start.");
    if (!headcount || headcount < 1) return setErr("Headcount must be ≥ 1.");
    const capacity = single + double * 2;
    if (capacity < headcount)
      return setErr(`Capacity (${capacity}) < headcount (${headcount}).`);

    try {
      setBusy(true);
      await api<{ id: string }>("/api/employer/requests", {
        method: "POST",
        body: JSON.stringify({
          hotel_id: hotelId,
          stay_start: startStr,
          stay_end: endStr,
          headcount,
          room_type_mix: { SINGLE: single, DOUBLE: double },
          notes: notes || undefined,
        }),
      });
      nav("/employer/requests");
    } catch (e: any) {
      setErr(e?.message || "Failed to create request");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Stack gap="md">
      <Title order={2}>New Room Request</Title>
      <Card withBorder radius="md" p="md">
        <Stack gap="sm">
          {hotelsErr && <Alert color="red">{hotelsErr}</Alert>}
          {err && <Alert color="red">{err}</Alert>}

          <Select
            label="Hotel"
            placeholder={hotelsLoading ? "Loading hotels..." : "Pick a hotel"}
            data={hotels} // [{ value: id, label: name }]
            value={hotelId}
            onChange={(v) => setHotelId(v)}
            searchable
            nothingFoundMessage="No hotels"
            comboboxProps={{ withinPortal: true }} // ✅ v7 way
            rightSection={hotelsLoading ? <Loader size="xs" /> : undefined}
            disabled={hotelsLoading || hotels.length === 0}
            required
          />

          <Group grow>
            <TextInput
              label="Check-in"
              type="date"
              value={startStr}
              onChange={(e) => setStartStr(e.currentTarget.value)}
              required
            />
            <TextInput
              label="Check-out"
              type="date"
              value={endStr}
              onChange={(e) => setEndStr(e.currentTarget.value)}
              required
            />
          </Group>

          <NumberInput
            label="Headcount"
            value={headcount}
            onChange={(v) => setHeadcount(Number(v) || 0)}
            min={1}
            required
          />
          <Group grow>
            <NumberInput
              label="Single rooms"
              value={single}
              onChange={(v) => setSingle(Number(v) || 0)}
              min={0}
            />
            <NumberInput
              label="Double rooms"
              value={double}
              onChange={(v) => setDouble(Number(v) || 0)}
              min={0}
            />
          </Group>

          <Textarea
            label="Notes"
            minRows={3}
            value={notes}
            onChange={(e) => setNotes(e.currentTarget.value)}
          />

          <Group>
            <Button loading={busy} onClick={submit}>
              Create
            </Button>
            <Button variant="default" onClick={() => nav(-1)}>
              Cancel
            </Button>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
}
