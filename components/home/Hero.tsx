import Link from "next/link";
import { siteConfig } from "@/config/site";

export default function Hero() {
  return (
    <section className="border-b border-line">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-20 text-center md:py-28">
        <p className="mb-4 text-sm tracking-wide text-muted">
          {siteConfig.fullName}
        </p>

        <h1 className="font-heading text-4xl font-bold leading-tight md:text-6xl">
          {siteConfig.tagline}
        </h1>

        <span className="my-8 block h-px w-24 bg-ink" />

        <p className="max-w-2xl text-lg leading-loose text-muted">
          {siteConfig.intro}
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          <Link
            href="#donate"
            className="bg-action px-8 py-4 font-semibold transition-colors hover:bg-action-hover"
          >
            تبرّع الآن
          </Link>
          <Link
            href="#help"
            className="border border-ink px-8 py-4 font-semibold transition-colors hover:bg-ink hover:text-white"
          >
            اطلب مساعدة
          </Link>
        </div>
      </div>
    </section>
  );
}