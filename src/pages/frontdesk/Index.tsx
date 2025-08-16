import { Button, Title, Text } from "@mantine/core";
import { useAuth } from "../../context/AuthContext";

export default function FrontDeskHome() {
  const { user, signOut } = useAuth();
  return (
    <div>
      <Title order={2} mb="sm">Front Desk Dashboard</Title>
      <Text c="dimmed" mb="md">Welcome {user?.email}</Text>
      <Button variant="default" onClick={signOut}>Sign out</Button>
    </div>
  );
}
