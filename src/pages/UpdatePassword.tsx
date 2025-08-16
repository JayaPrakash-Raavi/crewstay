import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import { Button, Paper, Stack, Title, PasswordInput, Alert, Text } from "@mantine/core";

export default function UpdatePassword() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string|null>(null);
  const [msg, setMsg] = useState<string|null>(null);
  const nav = useNavigate();

  // When user lands here from email link, Supabase sets a session automatically
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        setErr("Invalid or expired link. Request a new reset email.");
      }
    });
  }, []);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null); setMsg(null);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) setErr(error.message);
    else {
      setMsg("Password updated. You can now sign in.");
      setTimeout(() => nav("/login", { replace: true }), 1200);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <Paper shadow="sm" radius="md" p="lg" withBorder style={{ width: 420 }}>
        <Title order={3} mb="xs">Set a new password</Title>
        {err && <Alert color="red" mb="sm">{err}</Alert>}
        {msg && <Alert color="green" mb="sm">{msg}</Alert>}
        <form onSubmit={submit}>
          <Stack gap="sm">
            <PasswordInput label="New password" value={password}
              onChange={(e)=>setPassword(e.currentTarget.value)} required />
            <Button type="submit" loading={busy}>Update password</Button>
          </Stack>
        </form>
        <Text size="sm" mt="md" c="dimmed">
          This page is reached from the email reset link.
        </Text>
      </Paper>
    </div>
  );
}
