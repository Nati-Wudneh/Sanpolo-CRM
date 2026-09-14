import { createCompany } from "@/lib/actions";
import { SOURCE_LABELS, SOURCES, Source } from "@/lib/types";
import Link from "next/link";

export default async function NewCompanyPage({
  searchParams,
}: {
  searchParams: Promise<{ source?: string }>;
}) {
  const sp = await searchParams;
  const defaultSource: Source = SOURCES.includes(sp.source as Source)
    ? (sp.source as Source)
    : "outbound";

  return (
    <div className="max-w-xl space-y-5">
      <div>
        <Link href="/companies" className="text-sm text-slate-500 hover:text-slate-800">
          &larr; Back to companies
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900 mt-1">
          Add a company
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Add a company or contact you&apos;re tracking that wasn&apos;t already loaded.
        </p>
      </div>

      <form
        action={createCompany}
        className="bg-white border border-slate-200 rounded-lg p-5 space-y-4"
      >
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            List
          </label>
          <select
            name="source"
            defaultValue={defaultSource}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            {SOURCES.map((s) => (
              <option key={s} value={s}>
                {SOURCE_LABELS[s]}
              </option>
            ))}
          </select>
        </div>
        <Field label="Company name" name="name" required />
        <Field label="Sector / industry" name="sector_group" />
        <Field label="HQ / presence" name="hq_presence" placeholder="e.g. Addis Ababa" />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Priority
          </label>
          <select
            name="priority"
            defaultValue="Medium"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Watch">Watch</option>
          </select>
        </div>
        <button
          type="submit"
          className="rounded-md bg-emerald-600 text-white px-4 py-2 text-sm font-medium hover:bg-emerald-700"
        >
          Create company
        </button>
      </form>
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
