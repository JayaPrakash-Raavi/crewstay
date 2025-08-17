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
import { api } from "../lib/api"; // Adjust import path as needed
import { useAuth } from "../context/AuthContext";

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function validatePassword(v: string) {
  // Simple rule: at least 6 chars. Adjust if you want stronger checks.
  return v.length >= 6;
}

export default function Signup() {
  const nav = useNavigate();
  const { refresh } = useAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);

    // client-side validation
    if (!name.trim()) return setErr("Please enter your name.");
    if (!validateEmail(email)) return setErr("Please enter a valid email address.");
    if (!validatePassword(pw)) return setErr("Password must be at least 6 characters.");
    if (pw !== pw2) return setErr("Passwords do not match.");

    try {
      setBusy(true);
      await api("/api/signup", {
        method: "POST",
        body: JSON.stringify({ name: name.trim(), email: email.trim(), password: pw }),
      });

      // session cookie is set by the backend — refresh in-memory user and go to app
      await refresh();
      nav("/dashboard", { replace: true });
    } catch (e: any) {
      setErr(e?.message || "Signup failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <Paper shadow="sm" radius="md" p="lg" withBorder style={{ width: 420 }}>
        <Title order={3} mb="xs">Create your account</Title>
        <Text c="dimmed" size="sm" mb="md">
          You’ll start as an <b>Employer</b>. Roles can be updated by an Admin later.
        </Text>

        {err && <Alert color="red" mb="sm">{err}</Alert>}

        <form onSubmit={submit}>
          <Stack gap="sm">
            <TextInput
              label="Full name"
              placeholder="Jane Doe"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              required
            />
            <TextInput
              label="Email"
              type="email"
              placeholder="jane@example.com"
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              required
            />
            <PasswordInput
              label="Password"
              value={pw}
              onChange={(e) => setPw(e.currentTarget.value)}
              required
              description="At least 6 characters"
            />
            <PasswordInput
              label="Confirm password"
              value={pw2}
              onChange={(e) => setPw2(e.currentTarget.value)}
              required
            />
            <Button type="submit" loading={busy}>
              Create account
            </Button>
          </Stack>
        </form>

        <Group justify="space-between" mt="md">
          <Text size="sm">
            Already have an account? <Link to="/login">Sign in</Link>
          </Text>
        </Group>
      </Paper>
    </div>
  );
}
