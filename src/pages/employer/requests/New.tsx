import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Card, Container, Group, NumberInput, Select, Stack, Text, Textarea, Title } from "@mantine/core";
import { DateInput } from "@mantine/dates"; // if you don't want dates, use <input type="date"> instead
import { roomRequestSchema } from "../../../utils/zodSchemas";
import { z } from "zod";
import { supabase } from "../../../lib/supabaseClient";
import { notifications } from "@mantine/notifications";

type FormVals = z.infer<typeof roomRequestSchema>;

type Hotel = { id: string; name: string };

export default function EmployerNewRequest() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [employerId, setEmployerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting }, watch } = useForm<FormVals>({
    resolver: zodResolver(roomRequestSchema),
    defaultValues: {
      singleRooms: 0,
      doubleRooms: 0,
      headcount: 1,
    },
  });

  // Load profile (to get employer_id) and hotels
  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user?.id;
      if (!uid) {
        setLoading(false);
        return;
      }
      const { data: prof, error: perr } = await supabase
        .from("user_profiles")
        .select("employer_id")
        .eq("id", uid)
        .maybeSingle();
      if (perr || !prof?.employer_id) {
        notifications.show({ color: "red", title: "Profile not linked", message: "Your user is not linked to an employer. Ask admin to set employer_id." });
        setLoading(false);
        return;
      }
      setEmployerId(prof.employer_id);

      const { data: h } = await supabase.from("hotels").select("id,name").order("name");
      setHotels(h || []);
      setLoading(false);
    })();
  }, []);

  const stayStart = watch("stay_start");
  const stayEnd = watch("stay_end");
  const singleRooms = watch("singleRooms");
  const doubleRooms = watch("doubleRooms");

  const nights = useMemo(() => {
    if (!stayStart || !stayEnd) return 0;
    const a = new Date(stayStart); const b = new Date(stayEnd);
    return Math.max(0, Math.round((+b - +a) / (1000 * 60 * 60 * 24)));
  }, [stayStart, stayEnd]);

  const capacity = useMemo(() => singleRooms * 1 + doubleRooms * 2, [singleRooms, doubleRooms]);

  const onSubmit = async (vals: FormVals) => {
    if (!employerId) return;
    const { error } = await supabase.from("room_requests").insert({
      employer_id: employerId,
      hotel_id: vals.hotel_id,
      stay_start: vals.stay_start,
      stay_end: vals.stay_end,
      headcount: vals.headcount,
      room_type_mix: { SINGLE: vals.singleRooms, DOUBLE: vals.doubleRooms },
      notes: vals.notes || null,
      status: "SUBMITTED",
    });
    if (error) {
      notifications.show({ color: "red", title: "Failed to create request", message: error.message });
    } else {
      notifications.show({ color: "green", title: "Request submitted", message: "Hotel can now review your request." });
      // optional: navigate back to employer dashboard or list
      // navigate("/employer");
    }
  };

  if (loading) return <Container><Text>Loading…</Text></Container>;

  return (
    <Container size="sm" py="xl">
      <Title order={3} mb="md">Create Room Request</Title>
      <Card withBorder padding="lg" radius="md">
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack gap="sm">
            <Select
              label="Hotel"
              placeholder="Select a hotel"
              data={hotels.map(h => ({ value: h.id, label: h.name }))}
              onChange={(v) => setValue("hotel_id", v || "")}
              error={errors.hotel_id?.message}
              searchable
              nothingFoundMessage="No hotels"
            />

            {/* If you prefer HTML date inputs, replace these with inputs and remove @mantine/dates */}
            <DateInput
              label="Stay start"
              value={stayStart ? new Date(stayStart) : null}
              onChange={(d:any) => setValue("stay_start", d ? d.toISOString().slice(0,10) : "")}
              error={errors.stay_start?.message}
            />
            <DateInput
              label="Stay end"
              value={stayEnd ? new Date(stayEnd) : null}
              onChange={(d:any) => setValue("stay_end", d ? d.toISOString().slice(0,10) : "")}
              error={errors.stay_end?.message}
            />

            <Group grow>
              <NumberInput
                label="Headcount"
                min={1}
                defaultValue={1}
                {...register("headcount", { valueAsNumber: true })}
                error={errors.headcount?.message}
              />
              <NumberInput
                label="Single rooms"
                min={0}
                defaultValue={0}
                {...register("singleRooms", { valueAsNumber: true })}
                error={errors.singleRooms?.message}
              />
              <NumberInput
                label="Double rooms"
                min={0}
                defaultValue={0}
                {...register("doubleRooms", { valueAsNumber: true })}
                error={errors.doubleRooms?.message}
              />
            </Group>

            <Textarea label="Notes" minRows={3} {...register("notes")} />

            <Text c="dimmed" size="sm">
              Nights: <b>{nights}</b> • Capacity from room mix: <b>{capacity}</b> guests
            </Text>

            <Group justify="flex-end" mt="md">
              <Button type="submit" loading={isSubmitting}>Submit request</Button>
            </Group>
          </Stack>
        </form>
      </Card>
    </Container>
  );
}
