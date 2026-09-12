import { LegalPage } from "@/features/legal/legal-page";
import { legalDocuments } from "@/lib/legal-content";

export default function PrivacyPage() {
  return <LegalPage document={legalDocuments.privacy} />;
}
