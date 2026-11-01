import { siteConfig } from "@/config/site";

export default function Home() {
  return (
    <section className="flex flex-col items-center justify-center gap-8 px-4 py-24 text-center">
      <h1 className="font-heading text-5xl font-bold">{siteConfig.fullName}</h1>
      <p className="max-w-md text-muted">{siteConfig.tagline}</p>

      <div className="flex gap-3">
        <button className="bg-action px-6 py-3 font-semibold transition-colors hover:bg-action-hover">
          تبرّع الآن
        </button>
        <button className="border border-ink px-6 py-3 font-semibold transition-colors hover:bg-ink hover:text-white">
          اطلب مساعدة
        </button>
      </div>
    </section>
  );
}