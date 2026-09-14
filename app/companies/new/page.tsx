import { createCompany } from "@/lib/actions";
import Link from "next/link";

export default function NewCompanyPage() {
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
          Add a prospect that wasn&apos;t on the original research list.
        </p>
      </div>

      <form
        action={createCompany}
        className="bg-white border border-slate-200 rounded-lg p-5 space-y-4"
      >
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
