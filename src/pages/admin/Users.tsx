import { useEffect, useState } from "react";
import { Badge, Button, Group, Select, Table, Title } from "@mantine/core";
import { api } from "../../lib/api";

type UserRow = { id: string; email: string; name: string | null; role: "EMPLOYER"|"FRONTDESK"|"ADMIN"; employer_id?: string|null; hotel_id?: string|null; created_at: string };

export default function AdminUsers() {
  const [rows, setRows] = useState<UserRow[]>([]);
  async function load() {
    const res = await api<{ items: UserRow[] }>("/api/admin/users");
    setRows(res.items);
  }
  useEffect(() => { load(); }, []);

  async function changeRole(id: string, role: UserRow["role"]) {
    await api(`/api/admin/users/${id}/role`, { method: "PATCH", body: JSON.stringify({ role }) });
    load();
  }

  return (
    <div>
      <Group justify="space-between" mb="sm">
        <Title order={2}>Users</Title>
        <Button variant="default" onClick={load}>Reload</Button>
      </Group>

      <Table striped withColumnBorders stickyHeader>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Email</Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>Role</Table.Th>
            <Table.Th>Created</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {rows.map((u) => (
            <Table.Tr key={u.id}>
              <Table.Td>{u.email}</Table.Td>
              <Table.Td>{u.name ?? "—"}</Table.Td>
              <Table.Td>
                <Group gap="xs">
                  <Badge variant="light">{u.role}</Badge>
                  <Select
                    data={["EMPLOYER","FRONTDESK","ADMIN"]}
                    value={u.role}
                    onChange={(v) => v && changeRole(u.id, v as any)}
                    allowDeselect={false}
                    size="xs"
                  />
                </Group>
              </Table.Td>
              <Table.Td>{new Date(u.created_at).toLocaleString()}</Table.Td>
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </div>
  );
}
