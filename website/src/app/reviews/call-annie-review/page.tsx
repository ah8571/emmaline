import type { Metadata } from 'next';
import Link from 'next/link';

import InlineSources from '@/components/InlineSources';
import SeoArticleLayout from '@/components/SeoArticleLayout';
import { getConsumerCompetitor } from '@/lib/consumerCompetitors';

export const metadata: Metadata = {
  title: 'Call Annie Review And Alternatives | Emmaline',
  description:
    'A Call Annie review for people searching for AI phone assistant alternatives, with notes on what made the category interesting and where Emmaline can be differentiated.',
  alternates: {
    canonical: '/reviews/call-annie-review',
  },
};

export default function CallAnnieReviewPage() {
  const competitor = getConsumerCompetitor('call-annie');

  if (!competitor) {
    return null;
  }

  const toc = [
    { id: 'current-state', label: 'Current state of Call Annie' },
    { id: 'why-people-look', label: 'Why people still search for it' },
    { id: 'official-site', label: 'What the official site says now' },
    { id: 'reddit-signal', label: 'Reddit signal' },
    { id: 'what-to-look-for', label: 'What to look for instead' },
    { id: 'emmaline-angle', label: 'Where Emmaline fits' },
    { id: 'related-comparisons', label: 'Related comparisons' },
  ];

  return (
    <SeoArticleLayout
      eyebrow="Consumer Review"
      title="Call Annie Review: What To Look For In An AI Phone Assistant Alternative"
      intro="People searching for Call Annie usually are not looking for a generic chatbot. They are looking for the simplest possible mental model: call an AI, talk naturally, and get something more phone-native than a text chat app."
      toc={toc}
    >
      <section id="current-state" className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <h2 className="text-2xl font-semibold md:text-3xl">Current state of Call Annie</h2>
        <p className="leading-8 text-white/70">
          Call Annie still has search value because it gave people a clear way to understand the category. But the current official product story is no longer a broad AI phone assistant story. That is the main reason older comparisons now read strangely if they do not check the live site first.
          <InlineSources sources={competitor.reviewSources} />
        </p>
      </section>

      <section id="why-people-look" className="space-y-4">
        <h2 className="text-2xl font-semibold md:text-3xl">Why people still search for it</h2>
        <p className="leading-8 text-white/70">
          People searching for Call Annie are usually not looking for another AI chat window. They are looking for a phone-shaped interaction: less typing, less prompt engineering, and a quicker way to talk through an idea or question by voice.
        </p>
        <p className="leading-8 text-white/60">
          That search intent still matters even if the original product no longer looks like the best current answer. It tells you there is real consumer demand for a call-first AI assistant, not just for chatbots with a microphone button.
        </p>
      </section>

      <section id="official-site" className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 p-6 md:p-8">
          <h2 className="text-2xl font-semibold">What the official site says now</h2>
          <p className="mt-4 leading-8 text-white/70">
            The current Call Annie site frames the product as a language-learning app with video-call AI tutors, pronunciation checks, personal study plans, and vocabulary growth.
            <InlineSources sources={competitor.officialSources} />
          </p>
        </div>

        <div className="rounded-3xl border border-white/10 p-6 md:p-8">
          <h2 className="text-2xl font-semibold">What that means for buyers</h2>
          <p className="mt-4 leading-8 text-white/70">
            The same official page also says the Call Annie AI language-learning app has been discontinued. So the right read today is not that Call Annie is the best active AI phone assistant. The right read is that it helped define the category, but it no longer looks like the strongest live consumer option in that category.
            <InlineSources sources={competitor.reviewSources} />
          </p>
        </div>
      </section>

      <section id="reddit-signal" className="space-y-4 rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <h2 className="text-2xl font-semibold md:text-3xl">Reddit signal</h2>
        <p className="leading-8 text-white/70">
          Reddit signal is sparse and mostly historical. The remaining discussion tends to treat Call Annie as an older example of voice-to-voice AI rather than a product most users would recommend as the current center of their workflow.
          <InlineSources sources={competitor.redditSources} />
        </p>
      </section>

      <section id="what-to-look-for" className="grid gap-6 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 p-6 md:p-8">
          <h2 className="text-2xl font-semibold">What people liked about the idea</h2>
          <ul className="mt-4 space-y-3 text-white/70">
            <li className="leading-8">A clear call-an-AI mental model</li>
            <li className="leading-8">Lower friction than typing into a generic chatbot</li>
            <li className="leading-8">A voice-first interaction that felt more direct and human</li>
          </ul>
        </div>

        <div className="rounded-3xl border border-white/10 p-6 md:p-8">
          <h2 className="text-2xl font-semibold">What a modern alternative should improve</h2>
          <ul className="mt-4 space-y-3 text-white/70">
            <li className="leading-8">A stronger dedicated-assistant identity</li>
            <li className="leading-8">Useful post-call outputs like transcripts and notes</li>
            <li className="leading-8">A product direction that still looks current and expandable</li>
          </ul>
        </div>
      </section>

      <section id="emmaline-angle" className="space-y-4">
        <h2 className="text-2xl font-semibold md:text-3xl">Where Emmaline fits</h2>
        <p className="leading-8 text-white/70">
          Emmaline fits the gap Call Annie leaves behind if it stays disciplined about the workflow. The real opportunity is not to imitate a historical demo. The opportunity is to offer the same low-friction call-first feeling while making the conversation useful afterward through transcripts, call detail, notes, and brainstorming-friendly capture.
        </p>
        <p className="leading-8 text-white/60">
          That is a better long-term position than trying to become yet another huge general AI app. The searcher looking for Call Annie alternatives is usually telling you they want less interface overhead and more assistant presence.
        </p>
      </section>

      <section id="related-comparisons" className="rounded-3xl border border-white/10 bg-white/[0.03] p-6 md:p-8">
        <h2 className="text-2xl font-semibold md:text-3xl">Related comparisons</h2>
        <div className="mt-6 flex flex-wrap gap-4 text-sm">
          <Link href="/compare/call-annie-vs-emmaline" className="rounded-full border border-white/20 px-4 py-2 text-white transition hover:border-white hover:bg-white hover:text-black">
            Read Call Annie vs Emmaline
          </Link>
          <Link href="/compare/chatgpt-voice-vs-emmaline" className="rounded-full border border-white/20 px-4 py-2 text-white transition hover:border-white hover:bg-white hover:text-black">
            Read ChatGPT Voice vs Emmaline
          </Link>
          <Link href="/best-ai-phone-assistant" className="rounded-full border border-white/20 px-4 py-2 text-white transition hover:border-white hover:bg-white hover:text-black">
            View the comparison hub
          </Link>
        </div>
      </section>
    </SeoArticleLayout>
  );
}