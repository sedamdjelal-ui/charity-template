import { siteConfig } from "@/config/site";

export default function Volunteer() {
  const message = encodeURIComponent(
    `السلام عليكم، أرغب في التطوع مع ${siteConfig.fullName}.`
  );

  return (
    <section className="bg-ink text-white">
      <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-20 text-center">
        <h2 className="font-heading text-3xl font-bold md:text-4xl">
          تطوّع معنا
        </h2>
        <span className="mt-4 block h-px w-16 bg-white" />
        <p className="mt-6 max-w-2xl text-lg leading-loose opacity-80">
          وقتك ومهارتك يمكن أن يغيّرا حياة عائلة. انضم إلى فريق المتطوعين وشارك
          في حملات التوزيع والتنظيم والتوعية.
        </p>
        <a
          href={`https://wa.me/${siteConfig.contact.whatsapp}?text=${message}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 bg-action px-8 py-4 font-semibold text-ink transition-colors hover:bg-action-hover"
        >
          سجّل كمتطوع
        </a>
      </div>
    </section>
  );
}