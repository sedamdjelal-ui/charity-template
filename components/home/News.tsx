import { siteConfig } from "@/config/site";

export default function News() {
  return (
    <section id="news" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20">
      <div className="mb-12 text-center">
        <h2 className="font-heading text-3xl font-bold md:text-4xl">
          آخر الأخبار
        </h2>
        <span className="mx-auto mt-4 block h-px w-16 bg-ink" />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {siteConfig.news.map((item) => (
          <article key={item.id} className="border-t-2 border-ink pt-5">
            <p className="text-sm text-muted">{item.date}</p>
            <h3 className="mt-2 font-heading text-xl font-bold">{item.title}</h3>
            <p className="mt-3 leading-relaxed text-muted">{item.excerpt}</p>
          </article>
        ))}
      </div>
    </section>
  );
}