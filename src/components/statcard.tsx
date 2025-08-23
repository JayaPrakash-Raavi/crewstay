import { Paper, Text, Title } from "@mantine/core";

export default function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Paper withBorder radius="md" p="md" style={{ display: "grid", alignContent: "start" }}>
      <Text c="dimmed" size="sm">{label}</Text>
      <Title order={3} mt={4}>{value}</Title>
    </Paper>
  );
}
