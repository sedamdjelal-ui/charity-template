import { siteConfig } from "@/config/site";

export default function Activities() {
  const activities = siteConfig.activities.filter((a) => a.enabled);

  return (
    <section id="activities" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20">
      <div className="mb-12 text-center">
        <h2 className="font-heading text-3xl font-bold md:text-4xl">نشاطاتنا</h2>
        <span className="mx-auto mt-4 block h-px w-16 bg-ink" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {activities.map((activity, i) => (
          <article
            key={activity.id}
            className="border border-ink p-6 transition-colors hover:bg-ink hover:text-white"
          >
            <p className="font-heading text-3xl text-muted" dir="ltr">
              {String(i + 1).padStart(2, "0")}
            </p>
            <h3 className="mt-4 font-heading text-2xl font-bold">
              {activity.title}
            </h3>
            <p className="mt-3 leading-relaxed opacity-80">
              {activity.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}