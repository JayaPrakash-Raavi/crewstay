import { useState, type FormEvent } from "react";
import { supabase } from "../lib/supabaseClient";
import { Button, Paper, Stack, Text, TextInput, Title, Alert } from "@mantine/core";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string|null>(null);
  const [err, setErr] = useState<string|null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null); setMsg(null);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    setBusy(false);
    if (error) setErr(error.message);
    else setMsg("Check your email for a password reset link.");
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <Paper shadow="sm" radius="md" p="lg" withBorder style={{ width: 420 }}>
        <Title order={3} mb="xs">Reset your password</Title>
        {err && <Alert color="red" mb="sm">{err}</Alert>}
        {msg && <Alert color="green" mb="sm">{msg}</Alert>}
        <form onSubmit={submit}>
          <Stack gap="sm">
            <TextInput label="Email" type="email" value={email}
              onChange={(e)=>setEmail(e.currentTarget.value)} required />
            <Button type="submit" loading={busy}>Send reset link</Button>
          </Stack>
        </form>
        <Text size="sm" mt="md">We’ll email you a secure link to set a new password.</Text>
      </Paper>
    </div>
  );
}
