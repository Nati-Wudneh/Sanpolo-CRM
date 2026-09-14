"use client";

import { useTransition } from "react";
import { updateCompanyStatus } from "@/lib/actions";
import { STATUS_LABELS, Status, STATUS_COLORS } from "@/lib/types";

export function StatusSelector({
  companyId,
  status,
}: {
  companyId: number;
  status: Status;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <select
      value={status}
      disabled={isPending}
      onChange={(e) => {
        const next = e.target.value as Status;
        startTransition(() => {
          updateCompanyStatus(companyId, next);
        });
      }}
      className={`rounded-md ring-1 ring-inset px-2.5 py-1 text-sm font-medium focus:outline-none ${STATUS_COLORS[status]} ${isPending ? "opacity-60" : ""}`}
    >
      {(Object.keys(STATUS_LABELS) as Status[]).map((s) => (
        <option key={s} value={s}>
          {STATUS_LABELS[s]}
        </option>
      ))}
    </select>
  );
}
