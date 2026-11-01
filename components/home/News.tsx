import { Suspense } from "react";
import { createPublicClient } from "@/lib/supabase/public";

type NewsItem = {
  id: string;
  title: string;
  excerpt: string | null;
  published_at: string;
};

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ar-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

async function NewsList() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("news")
    .select("id, title, excerpt, published_at")
    .eq("published", true)
    .order("published_at", { ascending: false })
    .limit(3);

  const news = (data ?? []) as NewsItem[];

  if (error || news.length === 0) {
    return (
      <p className="border border-line py-12 text-center text-muted">
        لا توجد أخبار حالياً.
      </p>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-3">
      {news.map((item) => (
        <article key={item.id} className="border-t-2 border-ink pt-5">
          <p className="text-sm text-muted">{formatDate(item.published_at)}</p>
          <h3 className="mt-2 font-heading text-xl font-bold">{item.title}</h3>
          {item.excerpt && (
            <p className="mt-3 leading-relaxed text-muted">{item.excerpt}</p>
          )}
        </article>
      ))}
    </div>
  );
}

function NewsSkeleton() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="h-40 animate-pulse border-t-2 border-line" />
      ))}
    </div>
  );
}

export default function News() {
  return (
    <section id="news" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20">
      <div className="mb-12 text-center">
        <h2 className="font-heading text-3xl font-bold md:text-4xl">
          آخر الأخبار
        </h2>
        <span className="mx-auto mt-4 block h-px w-16 bg-ink" />
      </div>

      <Suspense fallback={<NewsSkeleton />}>
        <NewsList />
      </Suspense>
    </section>
  );
}