import Link from "next/link";
import { getSettings } from "@/lib/settings";

export default async function Hero() {
  const s = await getSettings();

  return (
    <section className="border-b border-line">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-20 text-center md:py-28">
        <p
          className="animate-fade-up mb-4 text-sm tracking-wide text-muted"
          style={{ animationDelay: "0.1s" }}
        >
          {s.fullName}
        </p>

        <h1
          className="animate-fade-up font-heading text-4xl font-bold leading-tight md:text-6xl"
          style={{ animationDelay: "0.25s" }}
        >
          {s.tagline}
        </h1>

        <span
          className="animate-fade-up my-8 block h-px w-24 bg-ink"
          style={{ animationDelay: "0.4s" }}
        />

        {s.intro && (
          <p
            className="animate-fade-up max-w-2xl text-lg leading-loose text-muted"
            style={{ animationDelay: "0.5s" }}
          >
            {s.intro}
          </p>
        )}

        <div
          className="animate-fade-up mt-10 flex flex-col gap-3 sm:flex-row"
          style={{ animationDelay: "0.65s" }}
        >
          <Link
            href="#donate"
            className="bg-action px-8 py-4 font-semibold transition-colors hover:bg-action-hover"
          >
            تبرّع الآن
          </Link>
          <Link
            href="#help"
            className="btn-outline border border-ink px-8 py-4 font-semibold"
          >
            اطلب مساعدة
          </Link>
        </div>
      </div>
    </section>
  );
}