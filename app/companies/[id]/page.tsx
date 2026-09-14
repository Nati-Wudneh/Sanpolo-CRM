import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { Company, Contact, Interaction } from "@/lib/types";
import { FitBadge, PriorityBadge } from "@/app/components/badges";
import { StatusSelector } from "./StatusSelector";
import { ContactsSection } from "./ContactsSection";
import { InteractionsSection } from "./InteractionsSection";
import { DetailsForm } from "./DetailsForm";
import { deleteCompany } from "@/lib/actions";
import { ConfirmDeleteButton } from "@/app/components/ConfirmDeleteButton";

export const dynamic = "force-dynamic";

export default async function CompanyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const companyId = Number(id);

  const company = db
    .prepare("SELECT * FROM companies WHERE id = ?")
    .get(companyId) as Company | undefined;

  if (!company) notFound();

  const contacts = db
    .prepare(
      "SELECT * FROM contacts WHERE company_id = ? ORDER BY is_primary DESC, id ASC",
    )
    .all(companyId) as Contact[];

  const interactions = db
    .prepare(
      "SELECT * FROM interactions WHERE company_id = ? ORDER BY occurred_at DESC",
    )
    .all(companyId) as Interaction[];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/companies" className="text-sm text-slate-500 hover:text-slate-800">
          &larr; Back to companies
        </Link>
      </div>

      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {company.name}
            </h1>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <PriorityBadge priority={company.priority} />
              <FitBadge fitType={company.fit_type} />
              {company.sector_group && (
                <span className="text-sm text-slate-500">
                  {company.sector_group}
                </span>
              )}
              {company.hq_presence && (
                <span className="text-sm text-slate-400">
                  · {company.hq_presence}
                </span>
              )}
            </div>
          </div>
          <StatusSelector companyId={company.id} status={company.status} />
        </div>

        {(company.what_they_do || company.why_fit) && (
          <div className="mt-4 pt-4 border-t border-slate-100 space-y-2 text-sm text-slate-600">
            {company.what_they_do && (
              <p>
                <span className="font-medium text-slate-700">
                  What they do:
                </span>{" "}
                {company.what_they_do}
              </p>
            )}
            {company.why_fit && (
              <p>
                <span className="font-medium text-slate-700">
                  Why they&apos;re a fit:
                </span>{" "}
                {company.why_fit}
              </p>
            )}
          </div>
        )}

        {(company.next_step || company.next_follow_up_date) && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap gap-4 text-sm">
            {company.next_step && (
              <div>
                <span className="font-medium text-slate-700">Next step:</span>{" "}
                <span className="text-slate-600">{company.next_step}</span>
              </div>
            )}
            {company.next_follow_up_date && (
              <div>
                <span className="font-medium text-slate-700">
                  Follow up on:
                </span>{" "}
                <span className="text-slate-600">
                  {company.next_follow_up_date}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ContactsSection companyId={company.id} contacts={contacts} />
        <section className="bg-white border border-slate-200 rounded-lg p-5">
          <h2 className="font-semibold text-slate-900 mb-4">Company details</h2>
          <DetailsForm company={company} />
        </section>
      </div>

      <InteractionsSection
        companyId={company.id}
        contacts={contacts}
        interactions={interactions}
      />

      <div className="pt-2">
        <form action={deleteCompany.bind(null, company.id)}>
          <ConfirmDeleteButton
            label="Delete this company"
            confirmText={`Delete ${company.name} and all its contacts/activity? This can't be undone.`}
            className="text-sm text-red-500 hover:text-red-700 hover:underline"
          />
        </form>
      </div>
    </div>
  );
}
