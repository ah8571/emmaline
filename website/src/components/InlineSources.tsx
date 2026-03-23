import React from 'react';

export type SourceLink = {
  label: string;
  href: string;
};

type InlineSourcesProps = {
  sources: SourceLink[];
};

export default function InlineSources({ sources }: InlineSourcesProps) {
  if (!sources.length) {
    return null;
  }

  return (
    <span className="text-white/45">
      {' '}
      (
      {sources.map((source, index) => (
        <React.Fragment key={source.href}>
          {index > 0 ? ', ' : null}
          <a
            href={source.href}
            target="_blank"
            rel="noreferrer"
            className="underline decoration-white/30 underline-offset-4 transition hover:text-white"
          >
            {source.label}
          </a>
        </React.Fragment>
      ))}
      )
    </span>
  );
}