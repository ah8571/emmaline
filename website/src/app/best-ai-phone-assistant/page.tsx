import type { Metadata } from 'next';
import Link from 'next/link';

import SeoArticleLayout from '@/components/SeoArticleLayout';
import { consumerCompetitors } from '@/lib/consumerCompetitors';

export const metadata: Metadata = {
  title: 'Best AI Phone Assistant For Everyday Tasks And Note Taking | Emmaline',
  description:
    'Compare consumer AI phone assistant alternatives for everyday help, voice conversations, and note taking, including Emmaline, ChatGPT Voice, Gemini Live, Replika, Pi, Character.AI, and Call Annie.',
  alternates: {
    canonical: '/best-ai-phone-assistant',
  },
};

const comparisonSlugs = new Set([
  'chatgpt-voice',
  'gemini-live',
  'replika',
  'pi',
  'character-ai',
  'call-annie',
]);

export default function BestAiPhoneAssistantPage() {
  return (
    <SeoArticleLayout
      eyebrow="Consumer AI Phone Assistant Guide"
      title="Best AI Phone Assistant For Everyday Tasks And Note Taking"
      intro="This guide compares consumer-facing AI voice products through the lens Emmaline cares about most: natural conversations, everyday assistance, and the possibility of a dedicated phone assistant experience."
    >
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold md:text-3xl">What this page is comparing</h2>
        <p className="text-base leading-8 text-white/70 md:text-lg">
          Many products in this category are really general voice assistants, AI companions, or entertainment experiences. Emmaline is aiming for a more focused lane: an AI phone assistant you can call, use for everyday help, and eventually shape into a more dedicated assistant setup.
        </p>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold md:text-3xl">Consumer alternatives to know</h2>
        <div className="grid gap-6">
          {consumerCompetitors.map((competitor) => {
            const comparisonHref = comparisonSlugs.has(competitor.slug)
              ? `/compare/${competitor.slug}-vs-emmaline`
              : undefined;
            const reviewHref = competitor.slug === 'call-annie' ? '/reviews/call-annie-review' : undefined;

            return (
              <article key={competitor.slug} className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.2em] text-white/45">{competitor.category}</p>
                    <h3 className="mt-2 text-2xl font-semibold">{competitor.name}</h3>
                  </div>

                  <p className="leading-8 text-white/70">{competitor.summary}</p>
                  <p className="leading-8 text-white/60">Best fit: {competitor.audience}</p>

                  <div className="flex flex-wrap gap-4 text-sm">
                    {comparisonHref ? (
                      <Link href={comparisonHref} className="rounded-full border border-white/20 px-4 py-2 text-white transition hover:border-white hover:bg-white hover:text-black">
                        Read {competitor.name} vs Emmaline
                      </Link>
                    ) : null}
                    {reviewHref ? (
                      <Link href={reviewHref} className="rounded-full border border-white/20 px-4 py-2 text-white transition hover:border-white hover:bg-white hover:text-black">
                        Read the review
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold md:text-3xl">Why Emmaline can still be differentiated</h2>
        <p className="text-base leading-8 text-white/70 md:text-lg">
          The opportunity is not to out-generalize the biggest AI products. The opportunity is to feel more dedicated: a voice-first AI assistant with a phone-native experience, a clearer identity, and a path toward dedicated-number and OpenClaw-style setups that make the assistant feel more personal and durable.
        </p>
      </section>
    </SeoArticleLayout>
  );
}