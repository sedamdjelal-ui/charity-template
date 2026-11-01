import { siteConfig } from "@/config/site";

export default function HelpRequest() {
  const { help, contact } = siteConfig;
  const message = encodeURIComponent(
    `السلام عليكم، أريد تقديم طلب مساعدة لدى ${siteConfig.fullName}.`
  );

  return (
    <section id="help" className="scroll-mt-24 border-y border-line">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-20 md:grid-cols-2">
        <div>
          <h2 className="font-heading text-3xl font-bold md:text-4xl">
            اطلب مساعدة
          </h2>
          <span className="mt-4 block h-px w-16 bg-ink" />
          <p className="mt-6 text-lg leading-loose text-muted">{help.intro}</p>
          <a
            href={`https://wa.me/${contact.whatsapp}?text=${message}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-8 inline-block bg-action px-8 py-4 font-semibold transition-colors hover:bg-action-hover"
          >
            قدّم طلبك الآن
          </a>
        </div>

        <div className="border border-ink p-6">
          <h3 className="font-heading text-2xl font-bold">الوثائق المطلوبة</h3>
          <ul className="mt-4">
            {help.documents.map((doc, i) => (
              <li
                key={doc}
                className="flex gap-4 border-b border-line py-3 last:border-b-0"
              >
                <span className="font-heading text-muted" dir="ltr">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>{doc}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}