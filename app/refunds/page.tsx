import { LegalPage } from "@/features/legal/legal-page";
import { legalDocuments } from "@/lib/legal-content";

export default function RefundsPage() {
  return <LegalPage document={legalDocuments.refunds} />;
}
