export type TocItem = {
  id: string;
  label: string;
};

type ArticleTableOfContentsProps = {
  items: TocItem[];
  title?: string;
};

export default function ArticleTableOfContents({
  items,
  title = 'On this page',
}: ArticleTableOfContentsProps) {
  if (!items.length) {
    return null;
  }

  return (
    <nav className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
      <p className="text-xs uppercase tracking-[0.24em] text-white/45">{title}</p>
      <ol className="mt-4 space-y-3 text-sm text-white/70">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              className="transition hover:text-white"
            >
              {item.label}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}