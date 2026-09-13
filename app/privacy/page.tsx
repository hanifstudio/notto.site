import type { Metadata } from "next";
import { LegalPage } from "@/features/legal/legal-page";
import { legalDocuments } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: legalDocuments.privacy.title,
  description: legalDocuments.privacy.introduction,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return <LegalPage document={legalDocuments.privacy} />;
}
