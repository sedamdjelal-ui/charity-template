import { getSettings } from "@/lib/settings";

export default async function Footer() {
  const s = await getSettings();
  const { address, contact, approval } = s;

  const fullAddress = [
    address.street,
    address.commune,
    address.daira,
    address.wilaya,
  ]
    .filter(Boolean)
    .join("، ");

  return (
    <footer id="contact" className="mt-24 border-t border-ink">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-3">
        <div>
          <p className="font-heading text-2xl font-bold">{s.name}</p>
          <p className="text-sm text-muted">{s.type}</p>
          <p className="mt-4 text-muted">{s.tagline}</p>
        </div>

        <div>
          <h3 className="mb-4 font-heading text-xl font-bold">تواصل معنا</h3>
          <ul className="space-y-3 text-muted">
            {fullAddress && <li>{fullAddress}</li>}
            {contact.phone && (
              <li>
                <a
                  href={`tel:${contact.phone.replace(/\s/g, "")}`}
                  className="hover:text-ink"
                >
                  <span dir="ltr">{contact.phone}</span>
                </a>
              </li>
            )}
            {contact.email && (
              <li>
                <a href={`mailto:${contact.email}`} className="hover:text-ink">
                  {contact.email}
                </a>
              </li>
            )}
            {contact.facebook && (
              <li>
                <a
                  href={contact.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-ink"
                >
                  صفحتنا على فيسبوك
                </a>
              </li>
            )}
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-heading text-xl font-bold">معلومات رسمية</h3>
          <ul className="space-y-3 text-muted">
            {approval.number && <li>رقم الاعتماد: {approval.number}</li>}
            {approval.authority && <li>الجهة المانحة: {approval.authority}</li>}
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 px-4 py-5 text-sm text-muted md:flex-row">
          <span>© {s.fullName} — جميع الحقوق محفوظة</span>
          <a
            href="https://www.djellalco.com"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-ink"
          >
            تصميم وتطوير: Djellal Design Studio
          </a>
        </div>
      </div>
    </footer>
  );
}