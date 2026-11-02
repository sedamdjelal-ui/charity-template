import { Suspense } from "react";
import Link from "next/link";
import { createPublicClient } from "@/lib/supabase/public";

type Activity = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
};

async function ActivitiesList() {
  const supabase = createPublicClient();
  const { data, error } = await supabase
    .from("activities")
    .select("id, slug, title, description")
    .eq("enabled", true)
    .order("sort_order", { ascending: true });

  const activities = (data ?? []) as Activity[];

  if (error || activities.length === 0) {
    return (
      <p className="border border-line py-12 text-center text-muted">
        لا توجد نشاطات حالياً.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {activities.map((activity, i) => (
        <Link
          key={activity.id}
          href={`/activities/${activity.slug}`}
          className="btn-outline flex flex-col border border-ink p-6"
        >
          <p className="font-heading text-3xl text-muted" dir="ltr">
            {String(i + 1).padStart(2, "0")}
          </p>
          <h3 className="mt-4 font-heading text-2xl font-bold">
            {activity.title}
          </h3>
          {activity.description && (
            <p className="mt-3 leading-relaxed opacity-80">
              {activity.description}
            </p>
          )}
          <span className="mt-auto pt-6 text-sm font-semibold">
            اقرأ المزيد ←
          </span>
        </Link>
      ))}
    </div>
  );
}

function ActivitiesSkeleton() {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="h-56 animate-pulse border border-line" />
      ))}
    </div>
  );
}

export default function Activities() {
  return (
    <section id="activities" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20">
      <div className="mb-12 text-center">
        <h2 className="font-heading text-3xl font-bold md:text-4xl">نشاطاتنا</h2>
        <span className="mx-auto mt-4 block h-px w-16 bg-ink" />
      </div>

      <Suspense fallback={<ActivitiesSkeleton />}>
        <ActivitiesList />
      </Suspense>
    </section>
  );
}