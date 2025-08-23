import { useEffect, useState } from "react";
import {
  Alert,
  Badge,
  Button,
  Card,
  Divider,
  Group,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

type UserInfo = { id: string; email: string; name: string; role: "EMPLOYER" | "FRONTDESK" | "ADMIN" };

export default function Account() {
  const { user: authUser, role } = useAuth();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  const [me, setMe] = useState<UserInfo | null>(null);
  const [name, setName] = useState("");
  // password form
  const [busySave, setBusySave] = useState(false);
  const [busyPw, setBusyPw] = useState(false);
  const [currPw, setCurrPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");

  async function load() {
    setErr(null); setOk(null);
    setLoading(true);
    try {
      const res = await api<{ user: UserInfo }>("/api/account", { cache: "no-store" });
      setMe(res.user);
      setName(res.user.name || "");
    } catch (e: any) {
      setErr(e?.message || "Failed to load account");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function saveProfile() {
    if (!name.trim()) { setErr("Name is required"); return; }
    setErr(null); setOk(null); setBusySave(true);
    try {
      const res = await api<{ user: UserInfo }>("/api/account", {
        method: "PUT",
        body: JSON.stringify({ name: name.trim() }),
      });
      setMe(res.user);
      setOk("Profile saved");
    } catch (e: any) {
      setErr(e?.message || "Failed to save");
    } finally {
      setBusySave(false);
    }
  }

  async function changePassword() {
    setErr(null); setOk(null);
    if (!currPw) return setErr("Enter your current password");
    if (newPw.length < 6) return setErr("New password must be at least 6 characters");
    if (newPw !== newPw2) return setErr("New passwords do not match");
    setBusyPw(true);
    try {
      await api("/api/account/password", {
        method: "PUT",
        body: JSON.stringify({ currentPassword: currPw, newPassword: newPw }),
      });
      setOk("Password updated");
      setCurrPw(""); setNewPw(""); setNewPw2("");
    } catch (e: any) {
      setErr(e?.message || "Failed to update password");
    } finally {
      setBusyPw(false);
    }
  }

  return (
    <Stack gap="md">
      <Group justify="space-between">
        <div>
          <Title order={2}>Account info</Title>
          <Text c="dimmed" size="sm">Signed in as {authUser?.email}</Text>
        </div>
        {role && <Badge variant="light" size="lg">{role}</Badge>}
      </Group>

      {err && <Alert color="red">{err}</Alert>}
      {ok && <Alert color="green">{ok}</Alert>}

      <Card withBorder p="md">
        <Title order={4} mb="xs">Profile</Title>
        <Stack gap="sm">
          <TextInput
            label="Full name"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
            disabled={loading || busySave}
            required
          />
          <TextInput
            label="Email"
            value={me?.email || ""}
            disabled
          />
          <TextInput
            label="Role"
            value={me?.role || ""}
            disabled
          />
          <Group>
            <Button loading={busySave} onClick={saveProfile} disabled={loading}>Save changes</Button>
          </Group>
        </Stack>
      </Card>

      <Card withBorder p="md">
        <Title order={4} mb="xs">Change password</Title>
        <Stack gap="sm">
          <PasswordInput
            label="Current password"
            value={currPw}
            onChange={(e) => setCurrPw(e.currentTarget.value)}
            disabled={loading || busyPw}
            required
          />
          <Group grow>
            <PasswordInput
              label="New password"
              value={newPw}
              onChange={(e) => setNewPw(e.currentTarget.value)}
              disabled={loading || busyPw}
              required
              description="At least 6 characters"
            />
            <PasswordInput
              label="Confirm new password"
              value={newPw2}
              onChange={(e) => setNewPw2(e.currentTarget.value)}
              disabled={loading || busyPw}
              required
            />
          </Group>
          <Group>
            <Button variant="default" onClick={() => { setCurrPw(""); setNewPw(""); setNewPw2(""); }} disabled={busyPw}>
              Reset
            </Button>
            <Button loading={busyPw} onClick={changePassword}>Update password</Button>
          </Group>
        </Stack>
      </Card>

      <Divider />
      <Text c="dimmed" size="xs">
        Email and role are managed by admins. Contact support if you need changes.
      </Text>
    </Stack>
  );
}
