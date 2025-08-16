import { Button, Title, Text } from "@mantine/core";
import { useAuth } from "../../context/AuthContext";

export default function AdminHome() {
  const { user, signOut } = useAuth();
  return (
    <div>
      <Title order={2} mb="sm">Admin Dashboard</Title>
      <Text c="dimmed" mb="md">Welcome {user?.email}</Text>
      <Button variant="default" onClick={signOut}>Sign out</Button>
    </div>
  );
}
