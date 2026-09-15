import Link from "next/link";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

interface ContactRow {
  id: number;
  name: string;
  title: string | null;
  department: string | null;
  phone: string | null;
  email: string | null;
  is_primary: number;
  company_id: number;
  company_name: string;
}

export default async function ContactsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const sp = await searchParams;

  const conditions: string[] = [];
  const params: Record<string, unknown> = {};
  if (sp.q) {
    conditions.push("(contacts.name LIKE @q OR companies.name LIKE @q)");
    params.q = `%${sp.q}%`;
  }
  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";

  const contacts = db
    .prepare(
      `SELECT contacts.*, companies.name as company_name
       FROM contacts
       JOIN companies ON companies.id = contacts.company_id
       ${where}
       ORDER BY contacts.name ASC`,
    )
    .all(params) as ContactRow[];

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Contacts</h1>
          <p className="text-slate-500 text-sm mt-1">
            Every individual you&apos;ve researched, across every company.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">{contacts.length} shown</span>
          <Link
            href="/contacts/new"
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white font-medium hover:bg-emerald-700"
          >
            + Add contact
          </Link>
        </div>
      </div>

      <form
        action="/contacts"
        className="bg-white border border-slate-200 rounded-lg p-4 flex flex-wrap gap-3 items-end"
      >
        <div className="flex-1 min-w-[220px]">
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Search
          </label>
          <input
            type="text"
            name="q"
            defaultValue={sp.q}
            placeholder="Contact or company name..."
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          className="rounded-md bg-slate-900 text-white text-sm px-4 py-1.5 hover:bg-slate-700"
        >
          Filter
        </button>
        {sp.q && (
          <Link
            href="/contacts"
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
              <Th>Name</Th>
              <Th>Title / department</Th>
              <Th>Company</Th>
              <Th>Phone</Th>
              <Th>Email</Th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {contacts.map((c) => (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link
                    href={`/companies/${c.company_id}`}
                    className="font-medium text-slate-800 hover:text-emerald-700"
                  >
                    {c.name}
                  </Link>
                  {!!c.is_primary && (
                    <span className="ml-2 text-xs rounded-full bg-emerald-100 text-emerald-700 px-2 py-0.5">
                      Primary
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {[c.title, c.department].filter(Boolean).join(" · ") || "—"}
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/companies/${c.company_id}`}
                    className="text-slate-600 hover:text-emerald-700"
                  >
                    {c.company_name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-slate-500">{c.phone || "—"}</td>
                <td className="px-4 py-3 text-slate-500">{c.email || "—"}</td>
              </tr>
            ))}
            {contacts.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                  No contacts yet. Open a company and add one, or use
                  &quot;+ Add contact&quot; above.
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
