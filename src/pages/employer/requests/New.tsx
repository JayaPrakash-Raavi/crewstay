import { useState } from "react";
import {
  Button,
  Card,
  Group,
  NumberInput,
  Select,
  Stack,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { useNavigate } from "react-router-dom";
import { api } from "../../../lib/api";

type HotelOption = { value: string; label: string };

// helper to adapt Mantine NumberInput onChange to our state setters
function numHandler(
  setter: React.Dispatch<React.SetStateAction<number | "">>
) {
  return (v: string | number) => {
    setter(v === "" ? "" : Number(v));
  };
}

export default function EmployerRequestNew() {
  const nav = useNavigate();

  // string dates from native date inputs
  const [startStr, setStartStr] = useState<string>("");
  const [endStr, setEndStr] = useState<string>("");

  const [hotelId, setHotelId] = useState<string>("");
  const [headcount, setHeadcount] = useState<number | "">(1);
  const [single, setSingle] = useState<number | "">(0);
  const [double, setDouble] = useState<number | "">(0);
  const [notes, setNotes] = useState<string>("");

  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const hotelOptions: HotelOption[] = [
    { value: "22222222-2222-2222-2222-222222222222", label: "Riverside Inn" },
  ];

  const validDateOrder = (a: string, b: string) =>
    new Date(a).getTime() < new Date(b).getTime();

  async function submit() {
    setErr(null);

    if (!hotelId) return setErr("Choose a hotel.");
    if (!startStr || !endStr) return setErr("Pick start and end dates.");
    if (!validDateOrder(startStr, endStr))
      return setErr("End must be after start.");
    if (!headcount || Number(headcount) < 1)
      return setErr("Headcount must be ≥ 1.");

    setBusy(true);
    try {
      const payload = {
        hotel_id: hotelId,
        stay_start: startStr, // YYYY-MM-DD
        stay_end: endStr, // YYYY-MM-DD
        headcount: Number(headcount),
        room_type_mix: {
          SINGLE: Number(single || 0),
          DOUBLE: Number(double || 0),
        },
        notes: notes || undefined,
      };

      await api<{ id: string }>("/api/employer/requests", {
        method: "POST",
        body: JSON.stringify(payload),
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
          {err && <Text c="red">{err}</Text>}

          <Select
            label="Hotel"
            placeholder="Pick a hotel"
            data={hotelOptions}
            value={hotelId}
            onChange={(v) => setHotelId(v ?? "")}
            required
          />

          <Group grow>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "var(--mantine-color-dimmed)",
                }}
              >
                Check-in
              </label>
              <input
                type="date"
                value={startStr}
                onChange={(e) => setStartStr(e.currentTarget.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ced4da",
                  borderRadius: 6,
                }}
              />
            </div>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  color: "var(--mantine-color-dimmed)",
                }}
              >
                Check-out
              </label>
              <input
                type="date"
                value={endStr}
                onChange={(e) => setEndStr(e.currentTarget.value)}
                style={{
                  width: "100%",
                  padding: "8px",
                  border: "1px solid #ced4da",
                  borderRadius: 6,
                }}
              />
            </div>
          </Group>

          <NumberInput
            label="Headcount"
            value={headcount}
            onChange={numHandler(setHeadcount)}
            min={1}
            required
          />

          <Group grow>
            <NumberInput
              label="Single rooms"
              value={single}
              onChange={numHandler(setSingle)}
              min={0}
            />
            <NumberInput
              label="Double rooms"
              value={double}
              onChange={numHandler(setDouble)}
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
            <Button variant="default" onClick={() => nav(-1)} disabled={busy}>
              Cancel
            </Button>
          </Group>
        </Stack>
      </Card>
    </Stack>
  );
}
