import type { Metadata } from "next";
import { LegalPage } from "@/features/legal/legal-page";
import { legalDocuments } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: legalDocuments.terms.title,
  description: legalDocuments.terms.introduction,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return <LegalPage document={legalDocuments.terms} />;
}
