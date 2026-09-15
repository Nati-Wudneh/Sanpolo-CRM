"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { disconnectGmail } from "@/lib/google";
import { sendEmail } from "@/lib/gmail";
import { SOURCES, Source, Status } from "@/lib/types";

function refreshCompany(id: number) {
  revalidatePath(`/companies/${id}`);
  revalidatePath("/companies");
  revalidatePath("/outbound");
  revalidatePath("/proformas");
  revalidatePath("/inbound");
  revalidatePath("/pipeline");
  revalidatePath("/contacts");
  revalidatePath("/");
}

export async function updateCompanyStatus(id: number, status: Status) {
  db.prepare(
    "UPDATE companies SET status = ?, updated_at = datetime('now') WHERE id = ?",
  ).run(status, id);
  refreshCompany(id);
}

export async function updateCompanyDetails(id: number, formData: FormData) {
  const sourceRaw = formData.get("source")?.toString();
  const source = SOURCES.includes(sourceRaw as Source)
    ? (sourceRaw as Source)
    : undefined;
  const fields = {
    priority: formData.get("priority")?.toString() || null,
    next_step: formData.get("next_step")?.toString() || null,
    next_follow_up_date:
      formData.get("next_follow_up_date")?.toString() || null,
    website: formData.get("website")?.toString() || null,
    general_phone: formData.get("general_phone")?.toString() || null,
    general_email: formData.get("general_email")?.toString() || null,
  };
  db.prepare(
    `UPDATE companies SET
      priority = @priority,
      next_step = @next_step,
      next_follow_up_date = @next_follow_up_date,
      website = @website,
      general_phone = @general_phone,
      general_email = @general_email,
      source = COALESCE(@source, source),
      updated_at = datetime('now')
    WHERE id = @id`,
  ).run({ ...fields, source: source ?? null, id });
  refreshCompany(id);
}

export async function updateCompanyNotes(id: number, notes: string) {
  db.prepare(
    "UPDATE companies SET notes = ?, updated_at = datetime('now') WHERE id = ?",
  ).run(notes || null, id);
  refreshCompany(id);
}

export async function createCompany(formData: FormData) {
  const name = formData.get("name")?.toString().trim();
  if (!name) return;
  const sourceRaw = formData.get("source")?.toString();
  const source = SOURCES.includes(sourceRaw as Source)
    ? (sourceRaw as Source)
    : "outbound";
  const info = db
    .prepare(
      `INSERT INTO companies (name, source, sector_group, priority, fit_type, hq_presence, status)
       VALUES (?, ?, ?, ?, 'NEW', ?, 'new')`,
    )
    .run(
      name,
      source,
      formData.get("sector_group")?.toString() || null,
      formData.get("priority")?.toString() || "Medium",
      formData.get("hq_presence")?.toString() || null,
    );
  redirect(`/companies/${info.lastInsertRowid}`);
}

export async function deleteCompany(id: number) {
  db.prepare("DELETE FROM companies WHERE id = ?").run(id);
  revalidatePath("/companies");
  revalidatePath("/");
  redirect("/companies");
}

function insertContact(companyId: number, formData: FormData): boolean {
  const name = formData.get("name")?.toString().trim();
  if (!name) return false;
  const isPrimary = formData.get("is_primary") ? 1 : 0;
  if (isPrimary) {
    db.prepare("UPDATE contacts SET is_primary = 0 WHERE company_id = ?").run(
      companyId,
    );
  }
  db.prepare(
    `INSERT INTO contacts (company_id, name, title, department, phone, email, is_primary, notes)
     VALUES (@company_id, @name, @title, @department, @phone, @email, @is_primary, @notes)`,
  ).run({
    company_id: companyId,
    name,
    title: formData.get("title")?.toString() || null,
    department: formData.get("department")?.toString() || null,
    phone: formData.get("phone")?.toString() || null,
    email: formData.get("email")?.toString() || null,
    is_primary: isPrimary,
    notes: formData.get("notes")?.toString() || null,
  });
  if (isPrimary === 0) {
    const existingPrimary = db
      .prepare(
        "SELECT COUNT(*) as n FROM contacts WHERE company_id = ? AND is_primary = 1",
      )
      .get(companyId) as { n: number };
    if (existingPrimary.n === 0) {
      db.prepare(
        `UPDATE contacts SET is_primary = 1 WHERE id = (
          SELECT id FROM contacts WHERE company_id = ? ORDER BY id DESC LIMIT 1
        )`,
      ).run(companyId);
    }
  }
  return true;
}

export async function addContact(companyId: number, formData: FormData) {
  insertContact(companyId, formData);
  refreshCompany(companyId);
}

export async function createContactStandalone(formData: FormData) {
  const companyId = Number(formData.get("company_id"));
  if (!companyId) return;
  const created = insertContact(companyId, formData);
  refreshCompany(companyId);
  if (created) redirect("/contacts");
}

export async function updateContact(
  id: number,
  companyId: number,
  formData: FormData,
) {
  const isPrimary = formData.get("is_primary") ? 1 : 0;
  if (isPrimary) {
    db.prepare(
      "UPDATE contacts SET is_primary = 0 WHERE company_id = ? AND id != ?",
    ).run(companyId, id);
  }
  db.prepare(
    `UPDATE contacts SET
      name = @name, title = @title, department = @department,
      phone = @phone, email = @email, is_primary = @is_primary, notes = @notes
     WHERE id = @id`,
  ).run({
    id,
    name: formData.get("name")?.toString().trim() || "",
    title: formData.get("title")?.toString() || null,
    department: formData.get("department")?.toString() || null,
    phone: formData.get("phone")?.toString() || null,
    email: formData.get("email")?.toString() || null,
    is_primary: isPrimary,
    notes: formData.get("notes")?.toString() || null,
  });
  refreshCompany(companyId);
}

export async function deleteContact(id: number, companyId: number) {
  db.prepare("DELETE FROM contacts WHERE id = ?").run(id);
  refreshCompany(companyId);
}

export async function addInteraction(companyId: number, formData: FormData) {
  const contactIdRaw = formData.get("contact_id")?.toString();
  const occurredAt = formData.get("occurred_at")?.toString();
  db.prepare(
    `INSERT INTO interactions (company_id, contact_id, type, outcome, summary, occurred_at)
     VALUES (@company_id, @contact_id, @type, @outcome, @summary, @occurred_at)`,
  ).run({
    company_id: companyId,
    contact_id: contactIdRaw ? Number(contactIdRaw) : null,
    type: formData.get("type")?.toString() || "call",
    outcome: formData.get("outcome")?.toString() || null,
    summary: formData.get("summary")?.toString() || null,
    occurred_at: occurredAt
      ? new Date(occurredAt).toISOString()
      : new Date().toISOString(),
  });

  const nextStep = formData.get("log_next_step")?.toString();
  const nextFollowUpDate = formData.get("log_next_follow_up_date")?.toString();
  const newStatus = formData.get("new_status")?.toString();
  if (nextStep || nextFollowUpDate || newStatus) {
    const sets: string[] = [];
    const params: Record<string, unknown> = { id: companyId };
    if (nextStep) {
      sets.push("next_step = @next_step");
      params.next_step = nextStep;
    }
    if (nextFollowUpDate) {
      sets.push("next_follow_up_date = @next_follow_up_date");
      params.next_follow_up_date = nextFollowUpDate;
    }
    if (newStatus) {
      sets.push("status = @status");
      params.status = newStatus;
    }
    sets.push("updated_at = datetime('now')");
    db.prepare(
      `UPDATE companies SET ${sets.join(", ")} WHERE id = @id`,
    ).run(params);
  }

  refreshCompany(companyId);
}

export async function deleteInteraction(id: number, companyId: number) {
  db.prepare("DELETE FROM interactions WHERE id = ?").run(id);
  refreshCompany(companyId);
}

/**
 * Creates a call interaction the instant someone clicks a phone number, so the
 * call is registered even if they never come back to fill in the outcome.
 * Returns the new interaction id so the UI can offer to fill in details right away.
 */
export async function quickLogCall(
  companyId: number,
  contactId: number | null,
) {
  const info = db
    .prepare(
      `INSERT INTO interactions (company_id, contact_id, type, occurred_at)
       VALUES (?, ?, 'call', datetime('now'))`,
    )
    .run(companyId, contactId);
  refreshCompany(companyId);
  return { id: Number(info.lastInsertRowid) };
}

export async function updateInteractionDetails(
  id: number,
  companyId: number,
  outcome: string,
  summary: string,
) {
  db.prepare(
    `UPDATE interactions SET outcome = @outcome, summary = @summary WHERE id = @id`,
  ).run({
    id,
    outcome: outcome || null,
    summary: summary || null,
  });
  refreshCompany(companyId);
}

export async function disconnectGmailAction() {
  disconnectGmail();
  revalidatePath("/settings");
}

export async function sendCompanyEmail(
  companyId: number,
  contactId: number | null,
  to: string,
  subject: string,
  body: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await sendEmail({ to, subject, body });
  } catch (err) {
    return {
      ok: false,
      error: err instanceof Error ? err.message : "Failed to send email.",
    };
  }
  db.prepare(
    `INSERT INTO interactions (company_id, contact_id, type, summary, occurred_at)
     VALUES (?, ?, 'email', ?, datetime('now'))`,
  ).run(companyId, contactId, `Sent to ${to} — Subject: ${subject}\n\n${body}`);
  refreshCompany(companyId);
  return { ok: true };
}
