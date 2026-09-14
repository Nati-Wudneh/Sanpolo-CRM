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
import { StatusBadge, PriorityBadge, FitBadge, SourceBadge } from "@/app/components/badges";

export type CompanyListSearchParams = {
  q?: string;
  status?: string;
  priority?: string;
  sector?: string;
  fit?: string;
  source?: string;
};

export async function CompanyListView({
  sp,
  fixedSource,
  basePath,
  title,
  subtitle,
}: {
  sp: CompanyListSearchParams;
  fixedSource?: Source;
  basePath: string;
  title: string;
  subtitle?: string;
}) {
  const scopeCondition = fixedSource ? "source = @scopeSource" : "1=1";
  const scopeParams = fixedSource ? { scopeSource: fixedSource } : {};

  const unfilteredCount = (
    db
      .prepare(`SELECT COUNT(*) as n FROM companies WHERE ${scopeCondition}`)
      .get(scopeParams) as { n: number }
  ).n;

  const sectors = (
    db
      .prepare(
        `SELECT DISTINCT sector_group FROM companies WHERE ${scopeCondition} AND sector_group IS NOT NULL ORDER BY sector_group`,
      )
      .all(scopeParams) as { sector_group: string }[]
  ).map((r) => r.sector_group);

  const priorities = (
    db
      .prepare(
        `SELECT DISTINCT priority FROM companies WHERE ${scopeCondition} AND priority IS NOT NULL ORDER BY priority`,
      )
      .all(scopeParams) as { priority: string }[]
  ).map((r) => r.priority);

  const conditions: string[] = [scopeCondition];
  const params: Record<string, unknown> = { ...scopeParams };

  if (sp.q) {
    conditions.push("name LIKE @q");
    params.q = `%${sp.q}%`;
  }
  if (!fixedSource && sp.source) {
    conditions.push("source = @source");
    params.source = sp.source;
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

  const where = `WHERE ${conditions.join(" AND ")}`;
  const companies = db
    .prepare(
      `SELECT c.*, (SELECT COUNT(*) FROM contacts WHERE company_id = c.id) as contact_count
       FROM companies c ${where}
       ORDER BY
        CASE priority WHEN 'High' THEN 0 WHEN 'Customer' THEN 0 WHEN 'Medium' THEN 1 WHEN 'Watch' THEN 2 ELSE 3 END,
        name ASC`,
    )
    .all(params) as (Company & { contact_count: number })[];

  const hasFilters = !!(
    sp.q ||
    sp.status ||
    sp.priority ||
    sp.sector ||
    sp.fit ||
    (!fixedSource && sp.source)
  );

  const addHref = fixedSource
    ? `/companies/new?source=${fixedSource}`
    : "/companies/new";

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
          {subtitle && (
            <p className="text-slate-500 text-sm mt-1 max-w-2xl">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">
            {companies.length} shown
          </span>
          <Link
            href={addHref}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white font-medium hover:bg-emerald-700"
          >
            + Add
          </Link>
        </div>
      </div>

      {unfilteredCount === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-lg p-10 text-center">
          <p className="text-slate-500">
            Nothing here yet.
            {fixedSource === "proforma_followup" &&
              " Upload the list of companies/individuals who previously asked for a proforma, or add them one at a time."}
            {fixedSource === "inbound" &&
              " Upload the list of inbound calls/inquiries, or add them one at a time."}
            {fixedSource === "outbound" &&
              " Add a company to start building your outbound list."}
          </p>
          <Link
            href={addHref}
            className="inline-block mt-4 rounded-md bg-emerald-600 px-4 py-2 text-sm text-white font-medium hover:bg-emerald-700"
          >
            + Add one now
          </Link>
        </div>
      ) : (
        <>
          <form
            action={basePath}
            className="bg-white border border-slate-200 rounded-lg p-4 flex flex-wrap gap-3 items-end"
          >
            <div className="flex-1 min-w-[180px]">
              <label className="block text-xs font-medium text-slate-500 mb-1">
                Search
              </label>
              <input
                type="text"
                name="q"
                defaultValue={sp.q}
                placeholder="Name..."
                className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
              />
            </div>
            {!fixedSource && (
              <Select name="source" label="List" defaultValue={sp.source}>
                <option value="">All</option>
                {SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {SOURCE_LABELS[s]}
                  </option>
                ))}
              </Select>
            )}
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
            {hasFilters && (
              <Link
                href={basePath}
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
                  {!fixedSource && <Th>List</Th>}
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
                      <div className="text-xs text-slate-400">
                        {c.hq_presence}
                      </div>
                    </td>
                    {!fixedSource && (
                      <td className="px-4 py-3">
                        <SourceBadge source={c.source} />
                      </td>
                    )}
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
                      colSpan={fixedSource ? 6 : 7}
                      className="px-4 py-8 text-center text-slate-400"
                    >
                      No companies match these filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
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
