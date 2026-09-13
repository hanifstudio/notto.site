import type { Metadata } from "next";
import { LegalPage } from "@/features/legal/legal-page";
import { legalDocuments } from "@/lib/legal-content";

export const metadata: Metadata = {
  title: legalDocuments.refunds.title,
  description: legalDocuments.refunds.introduction,
  alternates: { canonical: "/refunds" },
};

export default function RefundsPage() {
  return <LegalPage document={legalDocuments.refunds} />;
}
