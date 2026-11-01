import { siteConfig } from "@/config/site";

export default function Footer() {
  const { address, contact, approval } = siteConfig;

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
          <p className="font-heading text-2xl font-bold">{siteConfig.name}</p>
          <p className="text-sm text-muted">{siteConfig.type}</p>
          <p className="mt-4 text-muted">{siteConfig.tagline}</p>
        </div>

        <div>
          <h3 className="mb-4 font-heading text-xl font-bold">تواصل معنا</h3>
          <ul className="space-y-3 text-muted">
            <li>{fullAddress}</li>
            <li>
              <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="hover:text-ink">
                <span dir="ltr">{contact.phone}</span>
              </a>
            </li>
            <li>
              <a href={`mailto:${contact.email}`} className="hover:text-ink">
                {contact.email}
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-heading text-xl font-bold">معلومات رسمية</h3>
          <ul className="space-y-3 text-muted">
            <li>رقم الاعتماد: {approval.number}</li>
            <li>الجهة المانحة: {approval.authority}</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col justify-between gap-2 px-4 py-5 text-sm text-muted md:flex-row">
          <span>© {siteConfig.fullName} — جميع الحقوق محفوظة</span>
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