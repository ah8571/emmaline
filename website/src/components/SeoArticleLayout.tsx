import Link from 'next/link';
import React from 'react';

import ArticleTableOfContents, { TocItem } from './ArticleTableOfContents';
import SiteFooter from './SiteFooter';
import SiteHeader from './SiteHeader';

type SeoArticleLayoutProps = {
  eyebrow: string;
  title: string;
  intro: string;
  toc?: TocItem[];
  children: React.ReactNode;
};

export default function SeoArticleLayout({
  eyebrow,
  title,
  intro,
  toc = [],
  children,
}: SeoArticleLayoutProps) {
  return (
    <main className="min-h-screen bg-black text-white">
      <SiteHeader />
      <div className="mx-auto max-w-7xl px-4 py-16 md:py-24">
        <div className="mb-12 space-y-5 border-b border-white/10 pb-10">
          <p className="text-sm uppercase tracking-[0.24em] text-white/50">{eyebrow}</p>
          <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">{title}</h1>
          <p className="max-w-3xl text-lg leading-8 text-white/70 md:text-xl">{intro}</p>
          <div className="flex flex-wrap gap-4 text-sm text-white/60">
            <Link href="/" className="transition hover:text-white">
              Home
            </Link>
            <Link href="/best-ai-phone-assistant" className="transition hover:text-white">
              Best AI Phone Assistants
            </Link>
          </div>
        </div>

        {toc.length ? (
          <div className="mb-8 lg:hidden">
            <ArticleTableOfContents items={toc} title="Table of contents" />
          </div>
        ) : null}

        <div className="grid gap-12 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-start xl:gap-16">
          <article className="min-w-0 space-y-12">{children}</article>
          {toc.length ? (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <ArticleTableOfContents items={toc} title="Table of contents" />
              </div>
            </aside>
          ) : null}
        </div>
      </div>
      <SiteFooter />
    </main>
  );
}