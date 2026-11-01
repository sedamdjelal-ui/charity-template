import { getSettings } from "@/lib/settings";
import CountUp from "@/components/CountUp";

export default async function Stats() {
  const { stats } = await getSettings();

  if (stats.length === 0) return null;

  return (
    <section className="border-b border-line">
      <div className="mx-auto grid max-w-6xl grid-cols-2 md:grid-cols-4">
        {stats.map((stat, i) => (
          <div
            key={`${stat.label}-${i}`}
            className={`px-4 py-10 text-center ${
              i % 2 === 0 ? "border-l border-line" : ""
            } ${i < 2 ? "border-b border-line md:border-b-0" : ""} ${
              i === 1 ? "md:border-l" : ""
            } ${i === 3 ? "md:border-l-0" : ""}`}
          >
            <p className="font-heading text-4xl font-bold md:text-5xl" dir="ltr">
              <CountUp value={stat.value} />
            </p>
            <p className="mt-2 text-muted">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}