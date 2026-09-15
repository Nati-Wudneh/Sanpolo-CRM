import Link from "next/link";
import { db } from "@/lib/db";
import {
  Company,
  SOURCE_LABELS,
  SOURCES,
  STATUSES,
  STATUS_COLORS,
  STATUS_LABELS,
  Source,
  Status,
} from "@/lib/types";
import { PriorityBadge, SourceBadge } from "@/app/components/badges";
import { StatusSelector } from "@/app/companies/[id]/StatusSelector";

export const dynamic = "force-dynamic";

export default async function PipelinePage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const source = SOURCES.includes(sp.source as Source)
    ? (sp.source as Source)
    : undefined;

  const conditions: string[] = [];
  const params: Record<string, unknown> = {};
  if (source) {
    conditions.push("source = @source");
    params.source = source;
  }
  if (sp.q) {
    conditions.push("name LIKE @q");
    params.q = `%${sp.q}%`;
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const companies = db
    .prepare(
      `SELECT * FROM companies ${where} ORDER BY
        CASE priority WHEN 'High' THEN 0 WHEN 'Customer' THEN 0 WHEN 'Medium' THEN 1 WHEN 'Watch' THEN 2 ELSE 3 END,
        name ASC`,
    )
    .all(params) as Company[];

  const byStatus = Object.fromEntries(
    STATUSES.map((s) => [s, [] as Company[]]),
  ) as Record<Status, Company[]>;
  for (const c of companies) {
    (byStatus[c.status] ?? byStatus.new).push(c);
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Pipeline</h1>
          <p className="text-slate-500 text-sm mt-1">
            Every company by stage. Move a card forward with its status
            dropdown.
          </p>
        </div>
        <span className="text-sm text-slate-500">{companies.length} shown</span>
      </div>

      <form
        action="/pipeline"
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
            placeholder="Company name..."
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            List
          </label>
          <select
            name="source"
            defaultValue={sp.source ?? ""}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm bg-white focus:border-emerald-500 focus:outline-none"
          >
            <option value="">All</option>
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {SOURCE_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-slate-900 text-white text-sm px-4 py-1.5 hover:bg-slate-700"
        >
          Filter
        </button>
        {(sp.q || sp.source) && (
          <Link
            href="/pipeline"
            className="text-sm text-slate-500 hover:text-slate-800 px-2 py-1.5"
          >
            Clear
          </Link>
        )}
      </form>

      <div className="flex gap-4 overflow-x-auto pb-4">
        {STATUSES.map((status) => (
          <div key={status} className="w-72 shrink-0">
            <div
              className={`rounded-t-lg px-3 py-2 text-sm font-semibold ring-1 ring-inset ${STATUS_COLORS[status]}`}
            >
              {STATUS_LABELS[status]}{" "}
              <span className="font-normal opacity-70">
                ({byStatus[status].length})
              </span>
            </div>
            <div className="bg-slate-100 rounded-b-lg p-2 space-y-2 min-h-[120px]">
              {byStatus[status].map((c) => (
                <div
                  key={c.id}
                  className="bg-white rounded-md border border-slate-200 p-3 space-y-2"
                >
                  <Link
                    href={`/companies/${c.id}`}
                    className="font-medium text-sm text-slate-800 hover:text-emerald-700 block truncate"
                  >
                    {c.name}
                  </Link>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {!source && <SourceBadge source={c.source} />}
                    <PriorityBadge priority={c.priority} />
                  </div>
                  {c.sector_group && (
                    <div className="text-xs text-slate-400 truncate">
                      {c.sector_group}
                    </div>
                  )}
                  <StatusSelector companyId={c.id} status={c.status} />
                </div>
              ))}
              {byStatus[status].length === 0 && (
                <p className="text-xs text-slate-400 px-1 py-2">Empty</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
