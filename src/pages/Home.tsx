import { Container, Title, Text, Button, Group, Card, SimpleGrid } from "@mantine/core";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xs">Worker Lodging Platform</Title>
      <Text c="dimmed" mb="lg">
        Streamline temporary accommodation for construction crews. One place for
        employers, hotel front desks, and administrators — with audit logs and guardrails.
      </Text>

      <Group mb="xl">
        <Button onClick={() => navigate("/login")}>Sign in</Button>
      </Group>

      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
        <Card withBorder padding="lg" radius="md">
          <Title order={4} mb="xs">Employers</Title>
          <Text c="dimmed" size="sm">
            Create room requests, add workers (CSV), submit weekly extensions, and track statuses.
          </Text>
        </Card>
        <Card withBorder padding="lg" radius="md">
          <Title order={4} mb="xs">Hotel Front Desk</Title>
          <Text c="dimmed" size="sm">
            Review requests, assign rooms with capacity rules, check workers in and out.
          </Text>
        </Card>
        <Card withBorder padding="lg" radius="md">
          <Title order={4} mb="xs">Admin</Title>
          <Text c="dimmed" size="sm">
            Manage users and roles, monitor occupancy and SLAs, export reports.
          </Text>
        </Card>
      </SimpleGrid>
    </Container>
  );
}
