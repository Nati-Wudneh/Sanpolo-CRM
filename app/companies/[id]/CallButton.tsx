"use client";

import { useState, useTransition } from "react";
import { quickLogCall, updateInteractionDetails } from "@/lib/actions";
import { INTERACTION_OUTCOMES, INTERACTION_OUTCOME_LABELS } from "@/lib/types";

export function CallButton({
  companyId,
  contactId,
  phone,
}: {
  companyId: number;
  contactId: number | null;
  phone: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [loggedId, setLoggedId] = useState<number | null>(null);
  const [outcome, setOutcome] = useState("");
  const [summary, setSummary] = useState("");

  function handleClick() {
    startTransition(async () => {
      const { id } = await quickLogCall(companyId, contactId);
      setLoggedId(id);
    });
  }

  function handleSave() {
    if (!loggedId) return;
    startTransition(async () => {
      await updateInteractionDetails(loggedId, companyId, outcome, summary);
      setLoggedId(null);
      setOutcome("");
      setSummary("");
    });
  }

  if (loggedId) {
    return (
      <div className="border border-emerald-200 bg-emerald-50 rounded-md p-2.5 space-y-2 w-full max-w-xs">
        <p className="text-xs text-emerald-800">
          Call logged just now. Add the outcome, or fill it in later from the
          activity log below.
        </p>
        <select
          value={outcome}
          onChange={(e) => setOutcome(e.target.value)}
          className="w-full rounded border border-slate-300 text-xs px-2 py-1 bg-white"
        >
          <option value="">Outcome…</option>
          {INTERACTION_OUTCOMES.map((o) => (
            <option key={o} value={o}>
              {INTERACTION_OUTCOME_LABELS[o]}
            </option>
          ))}
        </select>
        <textarea
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          rows={2}
          placeholder="Notes..."
          className="w-full rounded border border-slate-300 text-xs px-2 py-1"
        />
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={handleSave}
            className="text-xs rounded bg-emerald-600 text-white px-2.5 py-1 hover:bg-emerald-700 disabled:opacity-50"
          >
            Save
          </button>
          <button
            type="button"
            onClick={() => {
              setLoggedId(null);
              setOutcome("");
              setSummary("");
            }}
            className="text-xs text-slate-500 hover:text-slate-800"
          >
            Skip for now
          </button>
        </div>
      </div>
    );
  }

  return (
    <a
      href={`tel:${phone}`}
      target="_self"
      rel="noopener"
      onClick={handleClick}
      title="Calling logs it here automatically"
      className={`text-emerald-700 hover:underline ${isPending ? "opacity-60" : ""}`}
    >
      {phone}
    </a>
  );
}
