import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProjects, getProjectBySlug } from '@/lib/content';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.priyeshmishra.com';

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(
  { params }: { params: { slug: string } }
): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug);
  if (!project) return { title: 'Project not found — Priyesh Mishra' };

  const title = `${project.title} — Case Study by Priyesh Mishra`;
  const description = project.descriptionShort || project.descriptionLong || `${project.title} case study by Priyesh Mishra.`;
  const url = `${SITE_URL}/projects/${project.slug}`;
  const image = project.coverImage?.url;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      images: image ? [{ url: image }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: image ? [image] : undefined,
    },
  };
}

export default async function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const project = await getProjectBySlug(params.slug);
  if (!project) notFound();

  const url = `${SITE_URL}/projects/${project.slug}`;
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    headline: project.title,
    description: project.descriptionShort || project.descriptionLong || '',
    url,
    image: project.coverImage?.url || undefined,
    keywords: (project.technologies || []).join(', ') || undefined,
    genre: project.category || undefined,
    author: { '@type': 'Person', name: 'Priyesh Mishra', url: SITE_URL },
    creator: { '@type': 'Person', name: 'Priyesh Mishra', url: SITE_URL },
  };

  const categories = project.categories && project.categories.length
    ? project.categories
    : project.category
      ? [project.category]
      : [];
  const hasLive = project.liveUrl && project.liveUrl !== '#';
  const hasSource = project.sourceUrl && project.sourceUrl !== '#';

  return (
    <main className="min-h-screen bg-gradient-to-br from-dark-bg to-purple-900/20 text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
      <article className="max-w-4xl mx-auto px-4 py-16 md:py-24">
        <nav className="mb-8 text-sm text-gray-400">
          <Link href="/" className="hover:text-white">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/projects" className="hover:text-white">Projects</Link>
          <span className="mx-2">/</span>
          <span className="text-white">{project.title}</span>
        </nav>

        <header className="mb-8">
          {project.category && (
            <span className="text-xs uppercase tracking-wide text-brand-purple">{project.category}</span>
          )}
          <h1 className="text-3xl md:text-5xl font-bold mt-2 mb-4">{project.title}</h1>
          {project.descriptionShort && (
            <p className="text-lg text-gray-300">{project.descriptionShort}</p>
          )}
        </header>

        {project.coverImage?.url && (
          <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-white/10 mb-10">
            <Image
              src={project.coverImage.url}
              alt={project.coverImage.alternativeText || project.title}
              width={1024}
              height={576}
              className="w-full h-full object-cover"
              priority
            />
          </div>
        )}

        {(project.timeline || project.clientName || project.outcome) && (
          <dl className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            {project.clientName && (
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <dt className="text-xs uppercase text-gray-500">Client</dt>
                <dd className="mt-1">{project.clientName}</dd>
              </div>
            )}
            {project.timeline && (
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <dt className="text-xs uppercase text-gray-500">Timeline</dt>
                <dd className="mt-1">{project.timeline}</dd>
              </div>
            )}
            {project.outcome && (
              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <dt className="text-xs uppercase text-gray-500">Outcome</dt>
                <dd className="mt-1">{project.outcome}</dd>
              </div>
            )}
          </dl>
        )}

        {project.descriptionLong && (
          <div className="prose prose-invert max-w-none mb-10">
            <p className="text-gray-300 leading-relaxed whitespace-pre-line">{project.descriptionLong}</p>
          </div>
        )}

        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {categories.map((c) => (
              <span key={c} className="text-xs px-3 py-1 rounded-full border border-white/15 bg-white/5">{c}</span>
            ))}
          </div>
        )}

        {project.technologies && project.technologies.length > 0 && (
          <div className="mb-10">
            <h2 className="text-sm uppercase tracking-wide text-gray-500 mb-2">Tools &amp; Technologies</h2>
            <div className="flex flex-wrap gap-2">
              {project.technologies.map((t) => (
                <span key={t} className="text-sm px-3 py-1 rounded-full border border-brand-purple/40 bg-brand-purple/10">{t}</span>
              ))}
            </div>
          </div>
        )}

        {(hasLive || hasSource) && (
          <div className="flex flex-wrap gap-4">
            {hasLive && (
              <a href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                 className="px-5 py-2.5 rounded-lg bg-brand-purple hover:bg-brand-purple/80 transition-colors font-medium">
                View live
              </a>
            )}
            {hasSource && (
              <a href={project.sourceUrl} target="_blank" rel="noopener noreferrer"
                 className="px-5 py-2.5 rounded-lg border border-white/20 hover:bg-white/10 transition-colors font-medium">
                View source
              </a>
            )}
          </div>
        )}
      </article>
    </main>
  );
}
