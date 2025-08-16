import { Button, Title, Text, Group } from "@mantine/core";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function EmployerHome() {
  const { user, signOut } = useAuth();
  const nav = useNavigate();

  return (
    <div>
      <Title order={2} mb="sm">Employer Dashboard</Title>
      <Text c="dimmed" mb="md">Welcome {user?.email}</Text>
      <Group>
        <Button onClick={() => nav("/employer/requests/new")}>Create Room Request</Button>
        <Button variant="default" onClick={signOut}>Sign out</Button>
      </Group>
    </div>
  );
}
