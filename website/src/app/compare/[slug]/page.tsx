import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import SeoArticleLayout from '@/components/SeoArticleLayout';
import {
  consumerCompetitorSlugs,
  getConsumerCompetitor,
} from '@/lib/consumerCompetitors';

type ComparisonPageProps = {
  params: {
    slug: string;
  };
};

function getBaseSlug(slug: string) {
  return slug.endsWith('-vs-emmaline') ? slug.slice(0, -'-vs-emmaline'.length) : slug;
}

export function generateStaticParams() {
  return consumerCompetitorSlugs.map((slug) => ({
    slug: `${slug}-vs-emmaline`,
  }));
}

export function generateMetadata({ params }: ComparisonPageProps): Metadata {
  const competitor = getConsumerCompetitor(getBaseSlug(params.slug));

  if (!competitor) {
    return {};
  }

  return {
    title: `${competitor.name} vs Emmaline | AI Phone Assistant Comparison`,
    description: `Compare ${competitor.name} and Emmaline across voice-first experience, assistant identity, and everyday AI phone assistant use cases.`,
    alternates: {
      canonical: `/compare/${params.slug}`,
    },
  };
}

export default function ComparisonPage({ params }: ComparisonPageProps) {
  const competitor = getConsumerCompetitor(getBaseSlug(params.slug));

  if (!competitor) {
    notFound();
  }

  return (
    <SeoArticleLayout
      eyebrow="Consumer Comparison"
      title={`${competitor.name} vs Emmaline`}
      intro={`This comparison looks at ${competitor.name} through Emmaline's intended lane: a practical AI phone assistant for everyday help, real conversations, and a more dedicated assistant identity.`}
    >
      <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <h2 className="text-2xl font-semibold md:text-3xl">Quick take</h2>
        <p className="leading-8 text-white/70">{competitor.summary}</p>
        <p className="leading-8 text-white/60">{competitor.emmalineAngle}</p>
      </section>

      <section className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <h2 className="text-2xl font-semibold md:text-3xl">Where Emmaline is different today</h2>
        <p className="leading-8 text-white/70">
          Emmaline is not just trying to be another place to talk to an AI. The product architecture already leans toward a voice-first notes workflow: call the assistant, think out loud, brainstorm in real time, and keep the useful parts through transcripts, call detail, and notes. That is a different use case from a general voice demo or companion chat.
        </p>
        <p className="leading-8 text-white/60">
          In practical terms, that makes Emmaline more interesting for users who want an AI phone assistant for everyday thinking, idea capture, and note-friendly conversations rather than only open-ended voice chatting.
        </p>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 p-6 md:p-8">
          <h2 className="text-2xl font-semibold">Where {competitor.name} is strong</h2>
          <ul className="mt-4 space-y-3 text-white/70">
            {competitor.strengths.map((strength) => (
              <li key={strength} className="leading-8">
                {strength}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-white/10 p-6 md:p-8">
          <h2 className="text-2xl font-semibold">Why users might still want Emmaline</h2>
          <ul className="mt-4 space-y-3 text-white/70">
            {competitor.limits.map((limit) => (
              <li key={limit} className="leading-8">
                {limit}
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold md:text-3xl">Best fit by user type</h2>
        <p className="leading-8 text-white/70">
          {competitor.name} is a stronger fit for {competitor.audience.toLowerCase()} Emmaline is a stronger fit for users who want a more focused AI phone assistant feel, direct phone-style interaction, note-taking around conversations, and eventually a dedicated assistant setup rather than just another general voice interface.
        </p>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <h2 className="text-2xl font-semibold md:text-3xl">Next step</h2>
        <p className="mt-4 leading-8 text-white/70">
          If you are comparing consumer AI voice tools and want something that feels more purpose-built around calling, conversation help, and a dedicated assistant identity, join the Emmaline waitlist and follow the broader comparison coverage in the hub page.
        </p>
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <Link href="/best-ai-phone-assistant" className="rounded-full border border-white/20 px-4 py-2 text-white transition hover:border-white hover:bg-white hover:text-black">
            View all consumer comparisons
          </Link>
          <Link href="/" className="rounded-full border border-white/20 px-4 py-2 text-white transition hover:border-white hover:bg-white hover:text-black">
            Visit the homepage
          </Link>
        </div>
      </section>
    </SeoArticleLayout>
  );
}