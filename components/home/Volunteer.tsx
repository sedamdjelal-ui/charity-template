import Link from "next/link";

export default function Volunteer() {
  return (
    <section className="border-y border-ink bg-action">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-20 text-center">
        <h2 className="font-heading text-3xl font-bold md:text-4xl">
          تطوّع معنا
        </h2>
        <span className="mt-4 block h-px w-16 bg-ink" />
        <p className="mt-6 max-w-2xl text-lg leading-loose">
          وقتك ومهارتك يمكن أن يغيّرا حياة عائلة. انضم إلى فريق المتطوعين وشارك
          في حملات التوزيع والتنظيم والتوعية.
        </p>
        <Link
          href="/volunteer"
          className="mt-10 border border-ink bg-white px-8 py-4 font-semibold transition-colors hover:bg-action-hover"
        >
          سجّل كمتطوع
        </Link>
      </div>
    </section>
  );
}