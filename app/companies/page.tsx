import Link from "next/link";
import { db } from "@/lib/db";
import { Company, STATUS_LABELS, Status } from "@/lib/types";
import { StatusBadge, PriorityBadge, FitBadge } from "@/app/components/badges";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  q?: string;
  status?: string;
  priority?: string;
  sector?: string;
  fit?: string;
}>;

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;

  const sectors = (
    db
      .prepare(
        "SELECT DISTINCT sector_group FROM companies WHERE sector_group IS NOT NULL ORDER BY sector_group",
      )
      .all() as { sector_group: string }[]
  ).map((r) => r.sector_group);

  const priorities = (
    db
      .prepare(
        "SELECT DISTINCT priority FROM companies WHERE priority IS NOT NULL ORDER BY priority",
      )
      .all() as { priority: string }[]
  ).map((r) => r.priority);

  const conditions: string[] = [];
  const params: Record<string, unknown> = {};

  if (sp.q) {
    conditions.push("name LIKE @q");
    params.q = `%${sp.q}%`;
  }
  if (sp.status) {
    conditions.push("status = @status");
    params.status = sp.status;
  }
  if (sp.priority) {
    conditions.push("priority = @priority");
    params.priority = sp.priority;
  }
  if (sp.sector) {
    conditions.push("sector_group = @sector");
    params.sector = sp.sector;
  }
  if (sp.fit) {
    conditions.push("fit_type = @fit");
    params.fit = sp.fit;
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const companies = db
    .prepare(
      `SELECT c.*, (SELECT COUNT(*) FROM contacts WHERE company_id = c.id) as contact_count
       FROM companies c ${where}
       ORDER BY
        CASE priority WHEN 'High' THEN 0 WHEN 'Customer' THEN 0 WHEN 'Medium' THEN 1 WHEN 'Watch' THEN 2 ELSE 3 END,
        name ASC`,
    )
    .all(params) as (Company & { contact_count: number })[];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Companies</h1>
        <span className="text-sm text-slate-500">
          {companies.length} shown
        </span>
      </div>

      <form className="bg-white border border-slate-200 rounded-lg p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px]">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Search
          </label>
          <input
            type="text"
            name="q"
            defaultValue={sp.q}
            placeholder="Company name..."
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <Select name="status" label="Status" defaultValue={sp.status}>
          <option value="">All</option>
          {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
            <option key={s} value={s}>
              {STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
        <Select name="priority" label="Priority" defaultValue={sp.priority}>
          <option value="">All</option>
          {priorities.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
        <Select name="sector" label="Sector" defaultValue={sp.sector}>
          <option value="">All</option>
          {sectors.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Select name="fit" label="Fit type" defaultValue={sp.fit}>
          <option value="">All</option>
          <option value="NEW">NEW</option>
          <option value="SHIFT">SHIFT</option>
          <option value="FLEET">FLEET</option>
        </Select>
        <button
          type="submit"
          className="rounded-md bg-slate-900 text-white text-sm px-4 py-1.5 hover:bg-slate-700"
        >
          Filter
        </button>
        {(sp.q || sp.status || sp.priority || sp.sector || sp.fit) && (
          <Link
            href="/companies"
            className="text-sm text-slate-500 hover:text-slate-800 px-2 py-1.5"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <Th>Company</Th>
              <Th>Sector</Th>
              <Th>Priority</Th>
              <Th>Fit</Th>
              <Th>Status</Th>
              <Th>Contacts</Th>
              <Th>Next follow-up</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {companies.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/companies/${c.id}`}
                    className="font-medium text-slate-800 hover:text-emerald-700"
                  >
                    {c.name}
                  </Link>
                  <div className="text-xs text-slate-400">{c.hq_presence}</div>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {c.sector_group}
                </td>
                <td className="px-4 py-3">
                  <PriorityBadge priority={c.priority} />
                </td>
                <td className="px-4 py-3">
                  <FitBadge fitType={c.fit_type} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={c.status} />
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {c.contact_count}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {c.next_follow_up_date || "—"}
                </td>
              </tr>
            ))}
            {companies.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-8 text-center text-slate-400"
                >
                  No companies match these filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
      {children}
    </th>
  );
}

function Select({
  name,
  label,
  defaultValue,
  children,
}: {
  name: string;
  label: string;
  defaultValue?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">
        {label}
      </label>
      <select
        name={name}
        defaultValue={defaultValue ?? ""}
        className="rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none bg-white"
      >
        {children}
      </select>
    </div>
  );
}
