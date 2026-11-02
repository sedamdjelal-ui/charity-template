import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createPublicClient } from "@/lib/supabase/public";

type Activity = {
  title: string;
  description: string | null;
  details: string | null;
  image: string | null;
};

async function ActivityDetail({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const supabase = createPublicClient();
  const { data } = await supabase
    .from("activities")
    .select("title, description, details, image")
    .eq("slug", slug)
    .eq("enabled", true)
    .maybeSingle();

  if (!data) notFound();

  const a = data as Activity;

  return (
    <article>
      <h1 className="font-heading text-4xl font-bold leading-tight md:text-5xl">
        {a.title}
      </h1>
      <span className="mt-6 block h-px w-16 bg-ink" />

      {a.description && (
        <p className="mt-8 text-xl leading-loose text-muted">
          {a.description}
        </p>
      )}

      {a.image && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={a.image}
          alt={a.title}
          className="mt-10 aspect-video w-full border border-ink object-cover"
        />
      )}

      {a.details && (
        <div className="mt-10 whitespace-pre-line text-lg leading-loose">
          {a.details}
        </div>
      )}

      <div className="mt-12 flex flex-col gap-3 border-t border-line pt-10 sm:flex-row">
        <Link
          href="/#donate"
          className="bg-action px-8 py-4 text-center font-semibold transition-colors hover:bg-action-hover"
        >
          تبرّع لهذا النشاط
        </Link>
        <Link
          href="/volunteer"
          className="btn-outline border border-ink px-8 py-4 text-center font-semibold"
        >
          تطوّع معنا
        </Link>
      </div>
    </article>
  );
}

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="h-12 w-2/3 animate-pulse bg-line" />
      <div className="h-6 w-full animate-pulse bg-line" />
      <div className="h-6 w-5/6 animate-pulse bg-line" />
    </div>
  );
}

export default function ActivityPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <Link
        href="/#activities"
        className="mb-10 inline-block text-sm font-semibold text-muted transition-colors hover:text-ink"
      >
        → كل النشاطات
      </Link>

      <Suspense fallback={<DetailSkeleton />}>
        <ActivityDetail params={params} />
      </Suspense>
    </section>
  );
}