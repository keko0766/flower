type Props = { title: string; updated: string; sections: { h: string; p: string }[] };

export default function LegalPage({ title, updated, sections }: Props) {
  return (
    <article className="mx-auto max-w-3xl px-4 py-10 md:py-16">
      <h1 className="font-serif text-4xl md:text-5xl">{title}</h1>
      <p className="mt-2 text-sm text-muted">{updated}</p>
      <div className="mt-10 space-y-8 rounded-[20px] bg-white p-6 md:p-10">
        {sections.map((s) => (
          <section key={s.h}>
            <h2 className="font-serif text-2xl">{s.h}</h2>
            <p className="mt-2 leading-relaxed text-ink/80">{s.p}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
