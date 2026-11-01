import Link from "next/link";
import { siteConfig } from "@/config/site";

function formatDZD(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(amount) + " دج";
}

export default function Campaigns() {
  const campaigns = siteConfig.campaigns.filter((c) => c.enabled);

  return (
    <section id="campaigns" className="scroll-mt-24 border-y border-line bg-white">
      <div className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="font-heading text-3xl font-bold md:text-4xl">
            الحملات الجارية
          </h2>
          <span className="mx-auto mt-4 block h-px w-16 bg-ink" />
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {campaigns.map((campaign) => {
            const percent = Math.min(
              100,
              Math.round((campaign.raised / campaign.goal) * 100)
            );

            return (
              <article
                key={campaign.id}
                className="flex flex-col border border-ink p-6"
              >
                <h3 className="font-heading text-2xl font-bold">
                  {campaign.title}
                </h3>
                <p className="mt-3 flex-1 leading-relaxed text-muted">
                  {campaign.description}
                </p>

                <div className="mt-6">
                  <div className="mb-2 flex justify-between text-sm">
                    <span className="font-semibold">{percent}%</span>
                    <span className="text-muted">
                      الهدف: <span dir="ltr">{formatDZD(campaign.goal)}</span>
                    </span>
                  </div>

                  <div className="h-3 w-full border border-ink bg-white">
                    <div
                      className="h-full bg-action"
                      style={{ width: `${percent}%` }}
                    />
                  </div>

                  <p className="mt-2 text-sm text-muted">
                    تم جمع: <span dir="ltr">{formatDZD(campaign.raised)}</span>
                  </p>
                </div>

                <Link
                  href="#donate"
                  className="mt-6 bg-action py-3 text-center font-semibold transition-colors hover:bg-action-hover"
                >
                  ساهم في الحملة
                </Link>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}