import { getSettings } from "@/lib/settings";
import CopyButton from "@/components/CopyButton";

export default async function Donate() {
  const { donation, contact } = await getSettings();

  const accounts = [
    { label: "الحساب البريدي الجاري CCP", value: donation.ccp },
    { label: "رقم الحساب RIP (للتحويل عبر بريدي موب)", value: donation.rip },
  ].filter((a) => a.value);

  return (
    <section id="donate" className="mx-auto max-w-4xl scroll-mt-24 px-4 py-20">
      <div className="mb-12 text-center">
        <h2 className="font-heading text-3xl font-bold md:text-4xl">
          كيف تتبرّع
        </h2>
        <span className="mx-auto mt-4 block h-px w-16 bg-ink" />
        {donation.accountName && (
          <p className="mt-6 text-muted">
            يمكنك التبرع بالتحويل إلى حساب الجمعية الرسمي باسم:{" "}
            <span className="font-semibold text-ink">{donation.accountName}</span>
          </p>
        )}
      </div>

      <div className="space-y-4">
        {accounts.map((account) => (
          <div
            key={account.label}
            className="flex flex-col gap-4 border border-ink p-5 sm:flex-row sm:items-center sm:justify-between"
          >
            <div>
              <p className="text-sm text-muted">{account.label}</p>
              <p className="mt-1 text-lg font-semibold tracking-wider" dir="ltr">
                {account.value}
              </p>
            </div>
            <CopyButton text={account.value} />
          </div>
        ))}
      </div>

      <div className="mt-8 border-t border-line pt-8 text-center">
        {contact.whatsapp && (
          <>
            <p className="text-muted">
              بعد التحويل، أرسل لنا صورة وصل الدفع لتأكيد تبرعك.
            </p>
            <a
              href={`https://wa.me/${contact.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block border border-ink px-6 py-3 font-semibold btn-outline"
            >
              إرسال الوصل عبر واتساب
            </a>
          </>
        )}
        {contact.phone && (
          <p className="mt-6 text-sm text-muted">
            للتبرعات العينية (مواد غذائية، ملابس، أدوية) اتصل بنا على{" "}
            <span dir="ltr">{contact.phone}</span>
          </p>
        )}
      </div>
    </section>
  );
}