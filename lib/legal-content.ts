import { LIFETIME_PRICE } from "@/lib/catalog";

export type LegalSection = {
  id: string;
  title: string;
  paragraphs: string[];
  bullets?: string[];
  table?: Array<[string, string]>;
};

export type LegalDocument = {
  title: string;
  updated: string;
  introduction: string;
  sections: LegalSection[];
};

export const legalDocuments = {
  terms: {
    title: "Terms of Service",
    updated: "12 September 2026",
    introduction: "Notto is a curated directory of complete HTML pages. You copy a page's HTML and adapt it with your own tools. These terms describe what you get, what you owe, and what happens if either of us stops.",
    sections: [
      { id: "what-notto-is", title: "What Notto is", paragraphs: [`Every template in the directory is a single, complete HTML page. Free templates can be copied by anyone without an account. Plus templates require Lifetime All Access, a one-time payment of $${LIFETIME_PRICE} USD. There is no subscription or recurring charge.`] },
      { id: "your-account", title: "Your account", paragraphs: ["You are responsible for keeping your account credentials private and for activity performed through your account. Contact us promptly if you believe your account has been compromised."] },
      { id: "payment", title: "Payment and access", paragraphs: ["Payments are processed by Gumroad. Notto never receives or stores your card details. Access is granted only after payment is verified; a return to this site is not by itself proof of payment."], table: [["Nothing", "All free templates, no account required"], [`$${LIFETIME_PRICE} USD once`, "Every plus template, including ones added later"]] },
      { id: "licence", title: "Licence to use templates", paragraphs: ["You may use any template you have copied in unlimited personal and commercial projects, modify it freely, and ship it to clients. You may not resell the templates as templates or redistribute the catalogue itself."], bullets: ["Unlimited personal and commercial projects.", "No attribution required.", "No redistribution of templates as templates.", "No transfer of account access to another person."] },
      { id: "refunds", title: "Refunds", paragraphs: ["You may request a refund within seven days of purchase if the account has not successfully copied a plus template. Once plus source has been copied, the purchase is non-refundable except where applicable law requires otherwise. An approved refund revokes Lifetime All Access while leaving free templates available."] },
      { id: "shutdown", title: "Shutdown pledge", paragraphs: ["If Notto is ever discontinued, every template in the catalogue will be released under an open-source licence. Your existing copies remain yours either way."] },
      { id: "contact", title: "Contact", paragraphs: ["Questions about these terms can be sent to support@notto.site."] },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    updated: "12 September 2026",
    introduction: "This policy explains the limited information Notto collects, why it is needed, and the choices available to you.",
    sections: [
      { id: "information", title: "Information we collect", paragraphs: ["Browsing free templates does not require an account. If you register, we store your normalized email address, password hash, session records, and basic security metadata."], bullets: ["Account and session information.", "Purchase and entitlement references from Gumroad.", "Template-copy events without the copied source.", "Operational logs needed for reliability and abuse prevention."] },
      { id: "use", title: "How information is used", paragraphs: ["We use this information to authenticate you, restore purchased access, prevent abuse, process support requests, and understand whether core product journeys work."] },
      { id: "payments", title: "Payments", paragraphs: ["Gumroad processes payments under its own privacy terms. Notto stores only the references and status needed to verify your purchase and entitlement; it does not receive your complete card details."] },
      { id: "retention", title: "Retention and security", paragraphs: ["Records are retained only as long as needed for account access, payment audit, legal obligations, and security. Passwords and session tokens are never stored in plain text."] },
      { id: "choices", title: "Your choices", paragraphs: ["You may request access to or deletion of your personal information, subject to records we must retain for legal or fraud-prevention purposes."] },
      { id: "contact", title: "Contact", paragraphs: ["Privacy questions and requests can be sent to support@notto.site."] },
    ],
  },
} satisfies Record<string, LegalDocument>;
