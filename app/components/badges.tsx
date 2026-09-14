import { Status, STATUS_COLORS, STATUS_LABELS } from "@/lib/types";

export function StatusBadge({ status }: { status: string }) {
  const s = status as Status;
  const cls =
    STATUS_COLORS[s] ?? "bg-slate-100 text-slate-700 ring-slate-300";
  const label = STATUS_LABELS[s] ?? status;
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}
    >
      {label}
    </span>
  );
}

const PRIORITY_COLORS: Record<string, string> = {
  High: "bg-red-100 text-red-700 ring-red-300",
  Medium: "bg-amber-100 text-amber-700 ring-amber-300",
  Watch: "bg-slate-100 text-slate-600 ring-slate-300",
  Customer: "bg-purple-100 text-purple-700 ring-purple-300",
  Converted: "bg-blue-100 text-blue-700 ring-blue-300",
};

export function PriorityBadge({ priority }: { priority: string | null }) {
  if (!priority) return null;
  const cls =
    PRIORITY_COLORS[priority] ?? "bg-slate-100 text-slate-600 ring-slate-300";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}
    >
      {priority}
    </span>
  );
}

const FIT_COLORS: Record<string, string> = {
  NEW: "bg-teal-100 text-teal-700 ring-teal-300",
  SHIFT: "bg-cyan-100 text-cyan-700 ring-cyan-300",
  FLEET: "bg-fuchsia-100 text-fuchsia-700 ring-fuchsia-300",
};

export function FitBadge({ fitType }: { fitType: string | null }) {
  if (!fitType) return null;
  const cls =
    FIT_COLORS[fitType] ?? "bg-slate-100 text-slate-600 ring-slate-300";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${cls}`}
    >
      {fitType}
    </span>
  );
}
