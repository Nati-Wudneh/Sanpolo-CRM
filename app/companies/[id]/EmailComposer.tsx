"use client";

import { useState, useTransition } from "react";
import { sendCompanyEmail } from "@/lib/actions";

export function EmailComposer({
  companyId,
  contactId,
  to,
}: {
  companyId: number;
  contactId: number;
  to: string;
}) {
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-xs text-emerald-700 hover:underline"
      >
        Compose email
      </button>
    );
  }

  return (
    <div className="border border-slate-200 rounded-md p-3 space-y-2 bg-slate-50">
      <input
        type="text"
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="Subject"
        className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
      />
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        placeholder={`Write your message to ${to}...`}
        className="w-full rounded border border-slate-300 px-2 py-1 text-sm"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      {sent ? (
        <p className="text-xs text-emerald-700">Sent.</p>
      ) : (
        <div className="flex gap-2">
          <button
            disabled={isPending || !subject.trim() || !body.trim()}
            onClick={() =>
              startTransition(async () => {
                setError(null);
                const result = await sendCompanyEmail(
                  companyId,
                  contactId,
                  to,
                  subject,
                  body,
                );
                if (result.ok) {
                  setSent(true);
                } else {
                  setError(result.error);
                }
              })
            }
            className="text-xs rounded bg-emerald-600 text-white px-3 py-1.5 hover:bg-emerald-700 disabled:opacity-50"
          >
            {isPending ? "Sending…" : "Send"}
          </button>
          <button
            onClick={() => setOpen(false)}
            className="text-xs text-slate-500 hover:text-slate-800 px-2 py-1.5"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
