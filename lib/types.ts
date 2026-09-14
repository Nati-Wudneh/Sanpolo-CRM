export const STATUSES = [
  "new",
  "researching",
  "contact_identified",
  "contacted",
  "follow_up",
  "interested",
  "not_interested",
  "customer",
  "on_hold",
] as const;

export type Status = (typeof STATUSES)[number];

export const STATUS_LABELS: Record<Status, string> = {
  new: "New",
  researching: "Researching",
  contact_identified: "Contact Identified",
  contacted: "Contacted",
  follow_up: "Follow-Up",
  interested: "Interested",
  not_interested: "Not Interested",
  customer: "Customer",
  on_hold: "On Hold",
};

export const STATUS_COLORS: Record<Status, string> = {
  new: "bg-slate-100 text-slate-700 ring-slate-300",
  researching: "bg-sky-100 text-sky-700 ring-sky-300",
  contact_identified: "bg-indigo-100 text-indigo-700 ring-indigo-300",
  contacted: "bg-amber-100 text-amber-700 ring-amber-300",
  follow_up: "bg-orange-100 text-orange-700 ring-orange-300",
  interested: "bg-emerald-100 text-emerald-700 ring-emerald-300",
  not_interested: "bg-rose-100 text-rose-700 ring-rose-300",
  customer: "bg-purple-100 text-purple-700 ring-purple-300",
  on_hold: "bg-gray-100 text-gray-500 ring-gray-300",
};

export const INTERACTION_TYPES = [
  "call",
  "email",
  "meeting",
  "note",
  "other",
] as const;
export type InteractionType = (typeof INTERACTION_TYPES)[number];

export const INTERACTION_OUTCOMES = [
  "no_answer",
  "left_voicemail",
  "reached_gatekeeper",
  "reached_target_contact",
  "callback_requested",
  "interested",
  "not_interested",
  "meeting_scheduled",
  "other",
] as const;
export type InteractionOutcome = (typeof INTERACTION_OUTCOMES)[number];

export const INTERACTION_OUTCOME_LABELS: Record<InteractionOutcome, string> =
  {
    no_answer: "No Answer",
    left_voicemail: "Left Voicemail",
    reached_gatekeeper: "Reached Gatekeeper / Reception",
    reached_target_contact: "Reached Target Contact",
    callback_requested: "Callback Requested",
    interested: "Interested",
    not_interested: "Not Interested",
    meeting_scheduled: "Meeting Scheduled",
    other: "Other",
  };

export interface Company {
  id: number;
  name: string;
  sector_group: string | null;
  what_they_do: string | null;
  why_fit: string | null;
  fit_type: string | null;
  priority: string | null;
  hq_presence: string | null;
  status: Status;
  next_step: string | null;
  next_follow_up_date: string | null;
  website: string | null;
  general_phone: string | null;
  general_email: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Contact {
  id: number;
  company_id: number;
  name: string;
  title: string | null;
  department: string | null;
  phone: string | null;
  email: string | null;
  is_primary: number;
  notes: string | null;
  created_at: string;
}

export interface Interaction {
  id: number;
  company_id: number;
  contact_id: number | null;
  type: InteractionType;
  outcome: InteractionOutcome | null;
  summary: string | null;
  occurred_at: string;
  created_at: string;
}
