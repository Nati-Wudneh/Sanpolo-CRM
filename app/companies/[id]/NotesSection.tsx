"use client";

import { useState } from "react";
import { updateCompanyNotes } from "@/lib/actions";

export function NotesSection({
  companyId,
  notes,
}: {
  companyId: number;
  notes: string | null;
}) {
  const [saved, setSaved] = useState(false);

  return (
    <section className="bg-white border border-slate-200 rounded-lg p-5">
      <h2 className="font-semibold text-slate-900 mb-3">Notes</h2>
      <form
        action={async (formData) => {
          await updateCompanyNotes(companyId, formData.get("notes")?.toString() ?? "");
          setSaved(true);
          setTimeout(() => setSaved(false), 1500);
        }}
        className="space-y-3"
      >
        <textarea
          name="notes"
          defaultValue={notes ?? ""}
          rows={6}
          placeholder="Everything worth remembering about this business — research notes, referral info, who you spoke to informally, objections raised, anything useful before the next call."
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
        />
        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="rounded-md bg-slate-900 text-white text-sm px-4 py-1.5 hover:bg-slate-700"
          >
            Save notes
          </button>
          {saved && <span className="text-sm text-emerald-600">Saved</span>}
        </div>
      </form>
    </section>
  );
}
