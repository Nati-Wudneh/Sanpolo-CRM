import {
  CompanyListSearchParams,
  CompanyListView,
} from "@/app/components/CompanyListView";
import { SOURCE_DESCRIPTIONS, SOURCE_LABELS } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function OutboundPage({
  searchParams,
}: {
  searchParams: Promise<CompanyListSearchParams>;
}) {
  const sp = await searchParams;
  return (
    <CompanyListView
      sp={sp}
      fixedSource="outbound"
      basePath="/outbound"
      title={SOURCE_LABELS.outbound}
      subtitle={SOURCE_DESCRIPTIONS.outbound}
    />
  );
}
