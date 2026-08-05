import Link from 'next/link';

/**
 * Server-rendered, crawlable version of the home page's core content.
 *
 * The interactive portfolio (PortfolioPage) is a client-only component, so the
 * raw HTML that search/social/AI crawlers receive would otherwise be just a
 * loading shell. This server component puts the real body text — bio, services,
 * projects, skills, experience — into the initial HTML, with internal
 * links to the dedicated /projects/[slug] pages. It is rendered inside a
 * <noscript> on the home page, so it stays in the served HTML for no-JS
 * crawlers/social scrapers but is never shown to JS-enabled users (no flash).
 */

type Data = {
  hero?: any;
  services?: any[];
  projects?: any[];
  experiences?: any[];
  skills?: any[];
};

export default function HomeSeoContent({ data }: { data: Data }) {
  const hero = data.hero || {};
  const services = data.services || [];
  const projects = data.projects || [];
  const experiences = data.experiences || [];
  const skills = data.skills || [];

  return (
    <section
      className="max-w-4xl mx-auto px-4 py-16 text-white bg-gradient-to-br from-dark-bg to-purple-900/20"
      aria-label="Portfolio overview"
    >
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-bold">{hero.name || 'Priyesh Mishra'}</h1>
        {hero.title && <p className="text-xl text-brand-purple mt-2">{hero.title}</p>}
        {hero.shortBio && <p className="text-gray-300 mt-4 leading-relaxed">{hero.shortBio}</p>}
      </header>

      {services.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">Services</h2>
          <ul className="space-y-2">
            {services.map((s: any, i: number) => (
              <li key={i} className="text-gray-300">
                <strong className="text-white">{s.title}</strong>
                {s.description ? ` — ${s.description}` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}

      {projects.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">Projects &amp; Case Studies</h2>
          <ul className="space-y-3">
            {projects.map((p: any) => (
              <li key={p.slug}>
                <Link href={`/projects/${p.slug}`} className="text-white font-medium hover:text-brand-purple">
                  {p.title}
                </Link>
                {p.descriptionShort && <p className="text-gray-400 text-sm mt-0.5">{p.descriptionShort}</p>}
              </li>
            ))}
          </ul>
          <p className="mt-4">
            <Link href="/projects" className="text-brand-purple hover:underline">View all projects →</Link>
          </p>
        </div>
      )}

      {skills.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">Skills &amp; Specialisations</h2>
          <p className="text-gray-300">{skills.map((s: any) => s.name).filter(Boolean).join(', ')}</p>
        </div>
      )}

      {experiences.length > 0 && (
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-3">Experience</h2>
          <ul className="space-y-2">
            {experiences.map((e: any, i: number) => (
              <li key={i} className="text-gray-300">
                <strong className="text-white">{e.positionTitle}</strong>
                {e.companyName ? ` @ ${e.companyName}` : ''}
                {e.startYear || e.endYear ? ` (${e.startYear || ''}${e.endYear ? `–${e.endYear}` : ''})` : ''}
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-gray-400">
        <Link href="/blog" className="text-brand-purple hover:underline">Read the blog →</Link>
      </p>
    </section>
  );
}
