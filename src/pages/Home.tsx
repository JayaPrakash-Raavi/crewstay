import { useEffect, useState } from "react";
import { Container, Title, Text, Button, Group, Card, SimpleGrid, Badge } from "@mantine/core";
import { useNavigate } from "react-router-dom";
import "./home.css";

export default function Home() {
  const nav = useNavigate();
  const [apiUp, setApiUp] = useState<boolean | null>(null);

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE ?? "";
    fetch(`${base}/api/health`, { credentials: "include" })
      .then((r) => setApiUp(r.ok))
      .catch(() => setApiUp(false));
  }, []);

  return (
    <Container size="lg" py="xl">
      {/* HERO */}
      <div className="hero">
        <Badge className="hero__eyebrow" variant="light" size="lg">
          Worker Lodging Platform
        </Badge>

        <Title order={1} className="hero__title">
          House your crew without the headaches
        </Title>

        <Text className="hero__subtitle">
          One place for <b>Employers</b>, <b>Hotel Front Desks</b>, and <b>Admins</b> to request rooms,
          assign workers, track check-ins/outs, and export audit-ready reports.
        </Text>

        <Group className="hero__cta" gap="sm">
          <Button size="md" onClick={() => nav("/login")}>Sign in</Button>
          <Button size="md" variant="default" onClick={() => nav("/signup")}>Create account</Button>
        </Group>

        <Group className="hero__badges" gap="xs">
          <Badge variant="outline">Role-based access</Badge>
          <Badge variant="outline">Capacity guardrails</Badge>
          <Badge variant="outline">Event logging</Badge>
          <Badge variant={apiUp ? "light" : "outline"} color={apiUp ? "green" : "gray"}>
            API: {apiUp === null ? "…" : apiUp ? "Online" : "Offline"}
          </Badge>
        </Group>
      </div>

      {/* VALUE */}
      <section className="section">
        <Title order={3} className="section__title">Built for your workflow</Title>
        <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" className="features-grid">
          <Card withBorder radius="md" className="feature-card">
            <Title order={4} className="feature-card__title">Employers</Title>
            <ul className="feature-card__list">
              <li>Create room requests (dates, headcount, room mix)</li>
              <li>Import workers via CSV, validate phones</li>
              <li>Submit weekly extensions in one click</li>
            </ul>
          </Card>
          <Card withBorder radius="md" className="feature-card">
            <Title order={4} className="feature-card__title">Hotel Front Desk</Title>
            <ul className="feature-card__list">
              <li>Review & accept/reject requests</li>
              <li>Drag-and-drop assignments with capacity rules</li>
              <li>Check-in/out by name, phone, or reservation</li>
            </ul>
          </Card>
          <Card withBorder radius="md" className="feature-card">
            <Title order={4} className="feature-card__title">Administrators</Title>
            <ul className="feature-card__list">
              <li>Manage users and roles</li>
              <li>Monitor occupancy & SLAs</li>
              <li>Export CSV reports, full event log</li>
            </ul>
          </Card>
        </SimpleGrid>
      </section>

      {/* STEPS */}
      <section className="section">
        <Title order={3} className="section__title">How it works</Title>
        <SimpleGrid cols={{ base: 1, sm: 5 }} spacing="sm">
          {[
            ["Request", "Employer submits dates, headcount, room mix."],
            ["Review", "Front Desk accepts/rejects with notes."],
            ["Assign", "Drag workers into rooms; rules prevent over-capacity."],
            ["Check-in/out", "Track arrivals and departures by reservation."],
            ["Extend & Report", "Weekly extensions + admin dashboards."],
          ].map(([t, d], i) => (
            <Card key={i} withBorder radius="md" className="step-card">
              <div className="step-card__num">{i + 1}</div>
              <Title order={5}>{t}</Title>
              <Text c="dimmed" size="sm">{d}</Text>
            </Card>
          ))}
        </SimpleGrid>
      </section>

      {/* CTA */}
      <section className="section cta-strip">
        <Title order={4} className="cta-strip__title">Ready to streamline worker lodging?</Title>
        <Group gap="sm">
          <Button onClick={() => nav("/login")}>Sign in</Button>
          <Button variant="default" onClick={() => nav("/signup")}>Create account</Button>
        </Group>
      </section>
    </Container>
  );
}
