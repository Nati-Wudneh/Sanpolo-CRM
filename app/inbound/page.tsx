import {
  CompanyListSearchParams,
  CompanyListView,
} from "@/app/components/CompanyListView";
import { SOURCE_DESCRIPTIONS, SOURCE_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function InboundPage({
  searchParams,
}: {
  searchParams: Promise<CompanyListSearchParams>;
}) {
  const sp = await searchParams;
  return (
    <CompanyListView
      sp={sp}
      fixedSource="inbound"
      basePath="/inbound"
      title={SOURCE_LABELS.inbound}
      subtitle={SOURCE_DESCRIPTIONS.inbound}
    />
  );
}
