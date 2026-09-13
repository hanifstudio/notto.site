import { PageShell } from "@/components/layout/page-shell";
import type { LegalDocument } from "@/lib/legal-content";

export function LegalPage({ document }: { document: LegalDocument }) {
  return (
    <PageShell back={{ label: "Back to Notto", href: "/" }}>
      <div className="legal-layout">
        <aside className="legal-nav">
          <strong>Contents</strong>
          <nav aria-label={`${document.title} contents`}>
            {document.sections.map((section) => <a key={section.id} href={`#${section.id}`}>{section.title}</a>)}
          </nav>
        </aside>
        <article className="legal-document">
          <header><h1>{document.title}</h1><p className="legal-updated">Last updated {document.updated}</p><p className="legal-intro">{document.introduction}</p></header>
          {document.sections.map((section) => (
            <section id={section.id} key={section.id}>
              <h2>{section.title}</h2>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.bullets ? <ul>{section.bullets.map((bullet) => <li key={bullet}>{bullet}</li>)}</ul> : null}
              {section.table ? (
                <div className="legal-table-wrap"><table><thead><tr><th>What you pay</th><th>What you get</th></tr></thead><tbody>{section.table.map(([price, access]) => <tr key={price}><td>{price}</td><td>{access}</td></tr>)}</tbody></table></div>
              ) : null}
            </section>
          ))}
          <div className="legal-contact">Questions? <a href="mailto:support@notto.site">support@notto.site</a></div>
        </article>
      </div>
    </PageShell>
  );
}
