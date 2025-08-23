import { useEffect, useState } from "react";
import {
  Accordion,
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
  Tabs,
} from "@mantine/core";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./home.css";

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true" {...props}>
      <path d="M16.707 5.293a1 1 0 0 1 0 1.414l-7.25 7.25a1 1 0 0 1-1.414 0L3.293 9.957a1 1 0 0 1 1.414-1.414l3.041 3.04 6.543-6.54a1 1 0 0 1 1.416 0z" />
    </svg>
  );
}

export default function Home() {
  const { user, role, loading, signOut } = useAuth();
  const [apiUp, setApiUp] = useState<boolean | null>(null);
  const nav = useNavigate();
  const loc = useLocation();
  const next = encodeURIComponent("/dashboard");

  useEffect(() => {
    const base = import.meta.env.VITE_API_BASE ?? "";
    fetch(`${base}/api/health`, { credentials: "include" })
      .then((r) => setApiUp(r.ok))
      .catch(() => setApiUp(false));
  }, []);

  return (
    <Container size="lg" py="xl">
      {/* HERO */}
      <section className="heroV2">
        <div className="heroV2__bg" />
        <Badge variant="light" size="lg" className="heroV2__eyebrow">
          Worker Lodging Platform
        </Badge>
        <Title order={1} className="heroV2__title">
          Book, assign, and track worker lodging <span className="accent">without spreadsheets</span>
        </Title>
        <Text className="heroV2__subtitle">
          For <b>Employers</b>, <b>Hotel Front Desks</b>, and <b>Admins</b>. Requests, room assignments,
          check-ins/outs, and CSV reporting — all in one place with audit logs.
        </Text>

        <Group gap="sm" className="heroV2__cta">
          {loading ? (
            <Button disabled>Loading…</Button>
          ) : user ? (
            <>
              <Button onClick={() => nav("/dashboard")}>Go to dashboard</Button>
              <Button variant="default" onClick={async () => { await signOut(); }}>
                Sign out
              </Button>
            </>
          ) : (
            <>
              <Button onClick={() => nav(`/login?next=${next}`)}>Sign in</Button>
              <Button variant="default" onClick={() => nav(`/signup?next=${next}`)}>Create account</Button>
            </>
          )}
        </Group>

        <Group gap="xs" className="heroV2__badges">
          <Badge variant="outline">Role-based access</Badge>
          <Badge variant="outline">Capacity guardrails</Badge>
          <Badge variant="outline">Event logging</Badge>
          <Badge variant={apiUp ? "light" : "outline"} color={apiUp ? "green" : "gray"}>
            API: {apiUp === null ? "…" : apiUp ? "Online" : "Offline"}
          </Badge>
        </Group>
      </section>

      {/* STATS */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md" className="statsGrid">
        {[
          ["Requests this week", "—"],
          ["Workers housed", "—"],
          ["Properties connected", "—"],
        ].map(([k, v]) => (
          <Paper key={k} withBorder radius="md" p="md" className="statCard">
            <Text c="dimmed" size="sm">{k}</Text>
            <Title order={3} mt={4}>{v}</Title>
          </Paper>
        ))}
      </SimpleGrid>

      {/* ROLE TABS */}
      <section className="section">
        <Title order={3} className="section__title">What you get</Title>
        <Tabs defaultValue={role ?? "EMPLOYER"} className="roleTabs">
          <Tabs.List grow>
            <Tabs.Tab value="EMPLOYER">Employers</Tabs.Tab>
            <Tabs.Tab value="FRONTDESK">Front Desk</Tabs.Tab>
            <Tabs.Tab value="ADMIN">Admin</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="EMPLOYER">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mt="md">
              <Card withBorder radius="md" className="featureCard">
                <Title order={4}>Create lodging requests</Title>
                <ul className="featureList">
                  <li><CheckIcon /> Pick hotel, dates, headcount, room mix</li>
                  <li><CheckIcon /> Import workers via CSV</li>
                  <li><CheckIcon /> Validate phone numbers automatically</li>
                </ul>
              </Card>
              <Card withBorder radius="md" className="featureCard">
                <Title order={4}>Manage changes</Title>
                <ul className="featureList">
                  <li><CheckIcon /> Submit weekly extensions (+7 days)</li>
                  <li><CheckIcon /> See status & arrival timelines</li>
                  <li><CheckIcon /> Export request summaries (CSV)</li>
                </ul>
              </Card>
            </SimpleGrid>
          </Tabs.Panel>

          <Tabs.Panel value="FRONTDESK">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mt="md">
              <Card withBorder radius="md" className="featureCard">
                <Title order={4}>Triaging requests</Title>
                <ul className="featureList">
                  <li><CheckIcon /> Accept / reject with notes</li>
                  <li><CheckIcon /> Conflict detection for overlaps</li>
                  <li><CheckIcon /> Filter by arrival date/status</li>
                </ul>
              </Card>
              <Card withBorder radius="md" className="featureCard">
                <Title order={4}>Assignments & check-ins</Title>
                <ul className="featureList">
                  <li><CheckIcon /> Drag-and-drop worker → room</li>
                  <li><CheckIcon /> Capacity rules enforced (1 / 2)</li>
                  <li><CheckIcon /> Check-in/out by name/phone/res #</li>
                </ul>
              </Card>
            </SimpleGrid>
          </Tabs.Panel>

          <Tabs.Panel value="ADMIN">
            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md" mt="md">
              <Card withBorder radius="md" className="featureCard">
                <Title order={4}>Governance</Title>
                <ul className="featureList">
                  <li><CheckIcon /> Manage users & roles</li>
                  <li><CheckIcon /> Row-level security on data</li>
                  <li><CheckIcon /> Audit trail for every action</li>
                </ul>
              </Card>
              <Card withBorder radius="md" className="featureCard">
                <Title order={4}>Reporting</Title>
                <ul className="featureList">
                  <li><CheckIcon /> Occupancy & in-house counts</li>
                  <li><CheckIcon /> SLA & extension uptake</li>
                  <li><CheckIcon /> One-click CSV exports</li>
                </ul>
              </Card>
            </SimpleGrid>
          </Tabs.Panel>
        </Tabs>
      </section>

      {/* HOW IT WORKS */}
      <section className="section">
        <Title order={3} className="section__title">How it works</Title>
        <SimpleGrid cols={{ base: 1, sm: 5 }} spacing="sm">
          {[
            ["Request", "Employer submits dates, headcount, room mix."],
            ["Review", "Front Desk accepts or rejects with notes."],
            ["Assign", "Drag workers into rooms with guardrails."],
            ["Check-in/out", "Track arrivals & departures reliably."],
            ["Extend & Report", "Weekly extensions and CSV exports."],
          ].map(([t, d], i) => (
            <Card key={i} withBorder radius="md" className="stepCard">
              <div className="stepNum">{i + 1}</div>
              <Title order={5}>{t}</Title>
              <Text c="dimmed" size="sm">{d}</Text>
            </Card>
          ))}
        </SimpleGrid>
      </section>

      {/* FAQ */}
      <section className="section">
        <Title order={3} className="section__title">FAQ</Title>
        <Accordion variant="separated" radius="md">
          <Accordion.Item value="cost">
            <Accordion.Control>How much does this cost?</Accordion.Control>
            <Accordion.Panel>
              The MVP runs on free-tier hosting: Vite + React on Vercel (frontend), Express API hosting, and Supabase
              Postgres. No billing or payments in the MVP.
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="auth">
            <Accordion.Control>How do users sign in?</Accordion.Control>
            <Accordion.Panel>
              Email + password via the app. Admins can invite other roles; Admin signup requires an invite code.
            </Accordion.Panel>
          </Accordion.Item>
          <Accordion.Item value="data">
            <Accordion.Control>Is there an audit log?</Accordion.Control>
            <Accordion.Panel>
              Yes — every meaningful action is written to the Event Log for traceability and compliance.
            </Accordion.Panel>
          </Accordion.Item>
        </Accordion>
      </section>

      {/* CTA */}
      <Divider my="lg" />
      <Paper withBorder radius="md" p="md" className="ctaStripe">
        <Stack gap={6}>
          <Title order={4} m={0}>Ready to streamline worker lodging?</Title>
          <Text c="dimmed" size="sm" m={0}>Start with a free account — you can invite teammates later.</Text>
        </Stack>
        <Group gap="sm">
          {user ? (
            <Button onClick={() => nav("/dashboard")}>Open dashboard</Button>
          ) : (
            <>
              <Button onClick={() => nav(`/signup?next=${next}`)}>Create account</Button>
              <Button variant="default" onClick={() => nav(`/login?next=${next}`)}>Sign in</Button>
            </>
          )}
        </Group>
      </Paper>
    </Container>
  );
}
