import Link from "next/link";
import { db } from "@/lib/db";
import {
  Company,
  SOURCE_LABELS,
  SOURCES,
  STATUS_LABELS,
  Source,
  Status,
} from "@/lib/types";

export const dynamic = "force-dynamic";

const SOURCE_ROUTES: Record<Source, string> = {
  outbound: "/outbound",
  proforma_followup: "/proformas",
  inbound: "/inbound",
};

export default function Dashboard() {
  const total = (
    db.prepare("SELECT COUNT(*) as n FROM companies").get() as { n: number }
  ).n;

  const bySource = db
    .prepare("SELECT source, COUNT(*) as n FROM companies GROUP BY source")
    .all() as { source: Source; n: number }[];
  const sourceMap = Object.fromEntries(bySource.map((r) => [r.source, r.n]));

  const byStatus = db
    .prepare(
      "SELECT status, COUNT(*) as n FROM companies GROUP BY status",
    )
    .all() as { status: Status; n: number }[];
  const statusMap = Object.fromEntries(byStatus.map((r) => [r.status, r.n]));

  const highPriorityNotStarted = db
    .prepare(
      `SELECT * FROM companies WHERE priority = 'High' AND status = 'new' ORDER BY name LIMIT 8`,
    )
    .all() as Company[];

  const today = new Date().toISOString().slice(0, 10);
  const upcomingFollowUps = db
    .prepare(
      `SELECT * FROM companies
       WHERE next_follow_up_date IS NOT NULL AND next_follow_up_date != ''
       ORDER BY next_follow_up_date ASC LIMIT 10`,
    )
    .all() as Company[];

  const overdue = upcomingFollowUps.filter(
    (c) => c.next_follow_up_date! < today,
  );
  const upcoming = upcomingFollowUps.filter(
    (c) => c.next_follow_up_date! >= today,
  );

  const recentInteractions = db
    .prepare(
      `SELECT i.*, c.name as company_name FROM interactions i
       JOIN companies c ON c.id = i.company_id
       ORDER BY i.occurred_at DESC LIMIT 8`,
    )
    .all() as (Record<string, unknown> & {
    id: number;
    company_id: number;
    company_name: string;
    type: string;
    outcome: string | null;
    occurred_at: string;
  })[];

  const contactsCount = (
    db.prepare("SELECT COUNT(*) as n FROM contacts").get() as { n: number }
  ).n;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Prospect tracking for e-bike outreach across Ethiopia.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {SOURCES.map((s) => (
          <Link
            key={s}
            href={SOURCE_ROUTES[s]}
            className="rounded-lg border border-slate-200 bg-white p-4 hover:border-emerald-300 hover:shadow-sm transition"
          >
            <div className="text-2xl font-semibold text-slate-900">
              {sourceMap[s] ?? 0}
            </div>
            <div className="text-sm text-slate-500 mt-0.5">
              {SOURCE_LABELS[s]}
            </div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard label="Total companies" value={total} href="/companies" />
        <StatCard
          label="Contacts logged"
          value={contactsCount}
          href="/companies"
        />
        <StatCard
          label="New / not started"
          value={statusMap["new"] ?? 0}
          href="/companies?status=new"
        />
        <StatCard
          label="Contacted"
          value={statusMap["contacted"] ?? 0}
          href="/companies?status=contacted"
        />
        <StatCard
          label="Interested"
          value={statusMap["interested"] ?? 0}
          href="/companies?status=interested"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white rounded-lg border border-slate-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-slate-900">
              High priority, not yet started
            </h2>
            <Link
              href="/companies?priority=High&status=new"
              className="text-sm text-emerald-700 hover:underline"
            >
              View all
            </Link>
          </div>
          {highPriorityNotStarted.length === 0 ? (
            <EmptyNote text="Nothing left — every high priority company has at least been started." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {highPriorityNotStarted.map((c) => (
                <li key={c.id} className="py-2.5 flex items-center justify-between gap-3">
                  <Link
                    href={`/companies/${c.id}`}
                    className="text-slate-800 hover:text-emerald-700 font-medium truncate"
                  >
                    {c.name}
                  </Link>
                  <span className="text-xs text-slate-400 shrink-0">
                    {c.sector_group}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white rounded-lg border border-slate-200 p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Follow-ups</h2>
          {overdue.length === 0 && upcoming.length === 0 ? (
            <EmptyNote text="No follow-up dates scheduled yet. Set one from a company page after a call." />
          ) : (
            <ul className="divide-y divide-slate-100">
              {overdue.map((c) => (
                <li key={c.id} className="py-2.5 flex items-center justify-between gap-3">
                  <Link
                    href={`/companies/${c.id}`}
                    className="text-slate-800 hover:text-emerald-700 font-medium truncate"
                  >
                    {c.name}
                  </Link>
                  <span className="text-xs font-medium text-red-600 shrink-0">
                    overdue &middot; {c.next_follow_up_date}
                  </span>
                </li>
              ))}
              {upcoming.map((c) => (
                <li key={c.id} className="py-2.5 flex items-center justify-between gap-3">
                  <Link
                    href={`/companies/${c.id}`}
                    className="text-slate-800 hover:text-emerald-700 font-medium truncate"
                  >
                    {c.name}
                  </Link>
                  <span className="text-xs text-slate-400 shrink-0">
                    {c.next_follow_up_date}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <section className="bg-white rounded-lg border border-slate-200 p-5">
        <h2 className="font-semibold text-slate-900 mb-4">Recent activity</h2>
        {recentInteractions.length === 0 ? (
          <EmptyNote text="No calls or notes logged yet. Open a company and log your first call." />
        ) : (
          <ul className="divide-y divide-slate-100">
            {recentInteractions.map((i) => (
              <li key={i.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <Link
                    href={`/companies/${i.company_id}`}
                    className="text-slate-800 hover:text-emerald-700 font-medium"
                  >
                    {i.company_name}
                  </Link>
                  <span className="text-slate-400 text-sm ml-2 capitalize">
                    {i.type}
                    {i.outcome ? ` · ${String(i.outcome).replace(/_/g, " ")}` : ""}
                  </span>
                </div>
                <span className="text-xs text-slate-400 shrink-0">
                  {new Date(i.occurred_at).toLocaleDateString()}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-9 gap-2">
        {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
          <Link
            key={s}
            href={`/companies?status=${s}`}
            className="rounded-md border border-slate-200 bg-white p-3 text-center hover:border-emerald-300 hover:shadow-sm transition"
          >
            <div className="text-lg font-semibold text-slate-900">
              {statusMap[s] ?? 0}
            </div>
            <div className="text-xs text-slate-500 mt-0.5">
              {STATUS_LABELS[s]}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  href,
}: {
  label: string;
  value: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-lg border border-slate-200 bg-white p-4 hover:border-emerald-300 hover:shadow-sm transition"
    >
      <div className="text-2xl font-semibold text-slate-900">{value}</div>
      <div className="text-sm text-slate-500 mt-0.5">{label}</div>
    </Link>
  );
}

function EmptyNote({ text }: { text: string }) {
  return <p className="text-sm text-slate-400">{text}</p>;
}
