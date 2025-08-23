import { useState, type FormEvent } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
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
  SegmentedControl,
} from "@mantine/core";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";

type Role = "EMPLOYER" | "FRONTDESK" | "ADMIN";

function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function validatePassword(v: string) {
  return v.length >= 6;
}

export default function Signup() {
  const nav = useNavigate();
  const { refresh } = useAuth();
  const [params] = useSearchParams();
  const next = params.get("next") || "/dashboard";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [role, setRole] = useState<Role>("EMPLOYER");
  const [adminCode, setAdminCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setErr(null);

    if (!name.trim()) return setErr("Please enter your name.");
    if (!validateEmail(email)) return setErr("Please enter a valid email address.");
    if (!validatePassword(pw)) return setErr("Password must be at least 6 characters.");
    if (pw !== pw2) return setErr("Passwords do not match.");
    if (role === "ADMIN" && !adminCode.trim()) return setErr("Admin invite code is required.");

    try {
      setBusy(true);
      await api("/api/signup", {
        method: "POST",
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password: pw,
          role,                // EMPLOYER | FRONTDESK | ADMIN
          adminCode: role === "ADMIN" ? adminCode.trim() : undefined,
        }),
      });

      await refresh(); // cookie is set by server
      nav(next, { replace: true });
    } catch (e: any) {
      setErr(e?.message || "Signup failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center" }}>
      <Paper shadow="sm" radius="md" p="lg" withBorder style={{ width: 460 }}>
        <Title order={3} mb="xs">Create your account</Title>
        <Text c="dimmed" size="sm" mb="md">
          Choose your role. <b>Admin</b> requires an invite code.
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

            <SegmentedControl
              fullWidth
              value={role}
              onChange={(v) => setRole(v as Role)}
              data={[
                { label: "Employer", value: "EMPLOYER" },
                { label: "Front Desk", value: "FRONTDESK" },
                { label: "Admin", value: "ADMIN" },
              ]}
            />

            {role === "ADMIN" && (
              <TextInput
                label="Admin invite code"
                placeholder="Enter your admin invite code"
                value={adminCode}
                onChange={(e) => setAdminCode(e.currentTarget.value)}
                required
              />
            )}

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
            Already have an account?{" "}
            <Link to={`/login?next=${encodeURIComponent(next)}`}>Sign in</Link>
          </Text>
        </Group>
      </Paper>
    </div>
  );
}
