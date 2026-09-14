"use client";

import { useState } from "react";
import { addInteraction, deleteInteraction } from "@/lib/actions";
import {
  Contact,
  Interaction,
  INTERACTION_OUTCOME_LABELS,
  INTERACTION_OUTCOMES,
  INTERACTION_TYPES,
  STATUS_LABELS,
  Status,
} from "@/lib/types";
import { ConfirmDeleteButton } from "@/app/components/ConfirmDeleteButton";

function nowLocal() {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
}

export function InteractionsSection({
  companyId,
  contacts,
  interactions,
}: {
  companyId: number;
  contacts: Contact[];
  interactions: Interaction[];
}) {
  const [formKey, setFormKey] = useState(0);

  return (
    <section className="bg-white border border-slate-200 rounded-lg p-5">
      <h2 className="font-semibold text-slate-900 mb-4">Log a call / activity</h2>
      <form
        key={formKey}
        action={async (formData) => {
          await addInteraction(companyId, formData);
          setFormKey((k) => k + 1);
        }}
        className="space-y-3 mb-6 border border-dashed border-slate-300 rounded-md p-4"
      >
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Type
            </label>
            <select
              name="type"
              defaultValue="call"
              className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm bg-white"
            >
              {INTERACTION_TYPES.map((t) => (
                <option key={t} value={t} className="capitalize">
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Outcome
            </label>
            <select
              name="outcome"
              defaultValue=""
              className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm bg-white"
            >
              <option value="">—</option>
              {INTERACTION_OUTCOMES.map((o) => (
                <option key={o} value={o}>
                  {INTERACTION_OUTCOME_LABELS[o]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Contact
            </label>
            <select
              name="contact_id"
              defaultValue=""
              className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm bg-white"
            >
              <option value="">Unspecified</option>
              {contacts.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              When
            </label>
            <input
              type="datetime-local"
              name="occurred_at"
              defaultValue={nowLocal()}
              className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Notes
          </label>
          <textarea
            name="summary"
            rows={2}
            placeholder="What happened, what they said..."
            className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 rounded-md p-3">
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Update status to
            </label>
            <select
              name="new_status"
              defaultValue=""
              className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm bg-white"
            >
              <option value="">Don&apos;t change</option>
              {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Next step
            </label>
            <input
              type="text"
              name="log_next_step"
              placeholder="e.g. Call back Thursday"
              className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-500 mb-1">
              Next follow-up date
            </label>
            <input
              type="date"
              name="log_next_follow_up_date"
              className="w-full rounded-md border border-slate-300 px-2.5 py-1.5 text-sm"
            />
          </div>
        </div>

        <button
          type="submit"
          className="rounded-md bg-emerald-600 text-white text-sm px-4 py-1.5 hover:bg-emerald-700"
        >
          Save activity
        </button>
      </form>

      <h3 className="font-medium text-slate-800 mb-3">History</h3>
      {interactions.length === 0 ? (
        <p className="text-sm text-slate-400">
          No activity logged yet for this company.
        </p>
      ) : (
        <ul className="space-y-3">
          {interactions.map((i) => {
            const contact = contacts.find((c) => c.id === i.contact_id);
            return (
              <li
                key={i.id}
                className="border border-slate-200 rounded-md p-3 flex items-start justify-between gap-3"
              >
                <div>
                  <div className="text-sm font-medium text-slate-800 capitalize">
                    {i.type}
                    {i.outcome && (
                      <span className="ml-2 text-xs font-normal rounded-full bg-slate-100 text-slate-600 px-2 py-0.5">
                        {INTERACTION_OUTCOME_LABELS[i.outcome]}
                      </span>
                    )}
                    {contact && (
                      <span className="ml-2 text-xs font-normal text-slate-400">
                        with {contact.name}
                      </span>
                    )}
                  </div>
                  {i.summary && (
                    <p className="text-sm text-slate-600 mt-1">{i.summary}</p>
                  )}
                  <div className="text-xs text-slate-400 mt-1">
                    {new Date(i.occurred_at).toLocaleString()}
                  </div>
                </div>
                <form action={deleteInteraction.bind(null, i.id, companyId)}>
                  <ConfirmDeleteButton confirmText="Delete this activity log entry?" />
                </form>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
