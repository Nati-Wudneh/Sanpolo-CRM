"use client";

import { useState } from "react";
import { updateCompanyDetails } from "@/lib/actions";
import { Company, SOURCE_LABELS, SOURCES } from "@/lib/types";

export function DetailsForm({ company }: { company: Company }) {
  const [saved, setSaved] = useState(false);

  return (
    <form
      action={async (formData) => {
        await updateCompanyDetails(company.id, formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 1500);
      }}
      className="space-y-4"
    >
      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">
          List
        </label>
        <select
          name="source"
          defaultValue={company.source}
          className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm bg-white"
        >
          {SOURCES.map((s) => (
            <option key={s} value={s}>
              {SOURCE_LABELS[s]}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Priority
          </label>
          <select
            name="priority"
            defaultValue={company.priority ?? ""}
            className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm bg-white"
          >
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Watch">Watch</option>
            <option value="Customer">Customer</option>
            <option value="Converted">Converted</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Next follow-up date
          </label>
          <input
            type="date"
            name="next_follow_up_date"
            defaultValue={company.next_follow_up_date ?? ""}
            className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">
          Next step
        </label>
        <input
          type="text"
          name="next_step"
          defaultValue={company.next_step ?? ""}
          placeholder="What needs to happen next"
          className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            General phone
          </label>
          <input
            type="text"
            name="general_phone"
            defaultValue={company.general_phone ?? ""}
            className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            General email
          </label>
          <input
            type="text"
            name="general_email"
            defaultValue={company.general_email ?? ""}
            className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-500 mb-1">
          Website
        </label>
        <input
          type="text"
          name="website"
          defaultValue={company.website ?? ""}
          className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
        />
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          className="rounded-md bg-slate-900 text-white text-sm px-4 py-1.5 hover:bg-slate-700"
        >
          Save
        </button>
        {saved && <span className="text-sm text-emerald-600">Saved</span>}
      </div>
    </form>
  );
}
