import {
  CompanyListSearchParams,
  CompanyListView,
} from "@/app/components/CompanyListView";
import { SOURCE_DESCRIPTIONS, SOURCE_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function ProformasPage({
  searchParams,
}: {
  searchParams: Promise<CompanyListSearchParams>;
}) {
  const sp = await searchParams;
  return (
    <CompanyListView
      sp={sp}
      fixedSource="proforma_followup"
      basePath="/proformas"
      title={SOURCE_LABELS.proforma_followup}
      subtitle={SOURCE_DESCRIPTIONS.proforma_followup}
    />
  );
}
