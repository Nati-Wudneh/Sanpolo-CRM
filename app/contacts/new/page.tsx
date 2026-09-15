import Link from "next/link";
import { db } from "@/lib/db";
import { createContactStandalone } from "@/lib/actions";

export const dynamic = "force-dynamic";

export default async function NewContactPage({
  searchParams,
}: {
  searchParams: Promise<{ company_id?: string }>;
}) {
  const sp = await searchParams;
  const companies = db
    .prepare("SELECT id, name FROM companies ORDER BY name ASC")
    .all() as { id: number; name: string }[];

  return (
    <div className="max-w-xl space-y-5">
      <div>
        <Link href="/contacts" className="text-sm text-slate-500 hover:text-slate-800">
          &larr; Back to contacts
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 mt-1">
          Add a contact
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Look for someone in purchasing / procurement / operations / admin —
          that&apos;s usually who signs off on a fleet or supply decision.
        </p>
      </div>

      {companies.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-300 rounded-lg p-8 text-center text-slate-500">
          No companies yet.{" "}
          <Link href="/companies/new" className="text-emerald-700 hover:underline">
            Add a company first
          </Link>
          .
        </div>
      ) : (
        <form
          action={createContactStandalone}
          className="bg-white border border-slate-200 rounded-lg p-5 space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Company
            </label>
            <select
              name="company_id"
              required
              defaultValue={sp.company_id ?? ""}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm bg-white"
            >
              <option value="" disabled>
                Select a company…
              </option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Name" name="name" required />
            <Field label="Title / role" name="title" placeholder="Purchasing Manager" />
            <Field label="Department" name="department" placeholder="Procurement" />
            <Field label="Phone" name="phone" />
          </div>
          <Field label="Email" name="email" />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" name="is_primary" />
            Primary contact for this company
          </label>
          <Field label="Notes" name="notes" placeholder="How you found them, gatekeeper info, etc." />
          <button
            type="submit"
            className="rounded-md bg-emerald-600 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-700"
          >
            Save contact
          </button>
        </form>
      )}
    </div>
  );
}

function Field({
  label,
  name,
  required,
  placeholder,
}: {
  label: string;
  name: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">
        {label}
      </label>
      <input
        type="text"
        name={name}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
      />
    </div>
  );
}
