import { useState, type FormEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  Alert,
  Button,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

export default function Login() {
  const nav = useNavigate();
  const { refresh } = useAuth();

  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!validateEmail(email)) return setErr("Please enter a valid email address.");
    if (!pw) return setErr("Please enter your password.");

    try {
      setBusy(true);
      await api("/api/login", {
        method: "POST",
        body: JSON.stringify({ email: email.trim(), password: pw }),
      });
      await refresh();                // fetch /api/me and store user
      nav("/dashboard", { replace: true });
    } catch (e: any) {
      setErr(e?.message || "Invalid email or password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <Paper shadow="sm" radius="md" p="lg" withBorder style={{ width: 420 }}>
        <Title order={3} mb="xs">Sign in</Title>
        <Text c="dimmed" size="sm" mb="md">Use the email and password you created.</Text>

        {err && <Alert color="red" mb="sm">{err}</Alert>}

        <form onSubmit={submit}>
          <Stack gap="sm">
            <TextInput
              label="Email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
            />
            <PasswordInput
              label="Password"
              value={pw}
              onChange={(e) => setPw(e.currentTarget.value)}
              required
            />
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
