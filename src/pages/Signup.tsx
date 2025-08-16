import { useState, type FormEvent } from "react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate, Link } from "react-router-dom";
import { Button, Paper, Stack, Text, TextInput, PasswordInput, Title, Alert, Group } from "@mantine/core";

export default function Login() {
  const [email, setEmail] = useState(""); 
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string|null>(null);
  const nav = useNavigate();

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      // Helpful message for unconfirmed email setups
      if (error.message.toLowerCase().includes("email not confirmed")) {
        setErr("Please confirm your email from your inbox before signing in.");
      } else {
        setErr(error.message);
      }
    } else {
      nav("/dashboard", { replace: true });
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <Paper shadow="sm" radius="md" p="lg" withBorder style={{ width: 380 }}>
        <Title order={3} mb="xs">Sign in</Title>
        <Text c="dimmed" size="sm" mb="md">Use your email and password.</Text>
        {err && <Alert color="red" mb="sm">{err}</Alert>}
        <form onSubmit={submit}>
          <Stack gap="sm">
            <TextInput label="Email" type="email" value={email}
              onChange={(e)=>setEmail(e.currentTarget.value)} required />
            <PasswordInput label="Password" value={password}
              onChange={(e)=>setPassword(e.currentTarget.value)} required />
            <Button type="submit" loading={busy}>Sign in</Button>
          </Stack>
        </form>
        <Group justify="space-between" mt="md">
          <Text size="sm">
            New here? <Link to="/signup">Create account</Link>
          </Text>
          <Text size="sm">
            <Link to="/forgot-password">Forgot password?</Link>
          </Text>
        </Group>
      </Paper>
    </div>
  );
}
