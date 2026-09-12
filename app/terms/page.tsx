import { LegalPage } from "@/features/legal/legal-page";
import { legalDocuments } from "@/lib/legal-content";

export default function TermsPage() {
  return <LegalPage document={legalDocuments.terms} />;
}
