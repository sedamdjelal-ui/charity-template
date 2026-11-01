import type { Metadata } from "next";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "سياسة الخصوصية",
};

const LAST_UPDATED = "نوفمبر 2026";

export default async function PrivacyPage() {
  const s = await getSettings();
  const address = [
    s.address.street,
    s.address.commune,
    s.address.daira,
    s.address.wilaya,
  ]
    .filter(Boolean)
    .join("، ");

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 leading-loose">
      <h1 className="font-heading text-4xl font-bold">سياسة الخصوصية</h1>
      <span className="mt-4 block h-px w-16 bg-ink" />
      <p className="mt-4 text-sm text-muted">آخر تحديث: {LAST_UPDATED}</p>

      <p className="mt-8">
        تحترم {s.fullName} خصوصية كل من يتعامل معها، وتلتزم بحماية بياناته
        الشخصية. توضّح هذه الصفحة البيانات التي نجمعها، ولماذا، وكيف نحميها.
      </p>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-bold">1. من نحن</h2>
        <p className="mt-3">
          {s.fullName}
          {address && `، ومقرها: ${address}`}
          {s.approval.number && `. رقم الاعتماد: ${s.approval.number}`}.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-bold">2. البيانات التي نجمعها</h2>
        <ul className="mt-3 list-inside list-disc space-y-2">
          <li>
            <strong>عند طلب المساعدة:</strong> الاسم واللقب، رقم الهاتف، العنوان،
            عدد أفراد العائلة، نوع المساعدة، ووصف الوضعية.
          </li>
          <li>
            <strong>عند التسجيل كمتطوع:</strong> الاسم واللقب، رقم الهاتف،
            العنوان، المهارات، وأوقات التوفّر.
          </li>
          <li>
            <strong>عند قبول طلب المساعدة:</strong> قد تطلب الجمعية رقم التعريف
            الوطني ووثائق إثبات الوضعية، لدراسة الملف ومنع تكرار المساعدات.
          </li>
        </ul>
        <p className="mt-3">
          لا نجمع أي بيانات من زوار الموقع الذين لا يرسلون نموذجاً.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-bold">3. لماذا نجمعها</h2>
        <ul className="mt-3 list-inside list-disc space-y-2">
          <li>دراسة طلبات المساعدة والتواصل مع أصحابها.</li>
          <li>تنظيم توزيع المساعدات بعدل، ومنع تكرارها لنفس العائلة.</li>
          <li>التواصل مع المتطوعين بخصوص أنشطة الجمعية.</li>
          <li>إعداد تقارير داخلية دون نشر أي بيانات شخصية.</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-bold">4. من يطّلع عليها</h2>
        <p className="mt-3">
          لا يطّلع على البيانات إلا أعضاء الجمعية المخوّلون، عبر حسابات محمية
          بكلمة سر. لا نبيع البيانات، ولا ننشرها، ولا نشاركها مع أي جهة، إلا إذا
          ألزمنا القانون بذلك.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-bold">5. كيف نحميها</h2>
        <ul className="mt-3 list-inside list-disc space-y-2">
          <li>الاتصال بالموقع مشفّر (HTTPS).</li>
          <li>البيانات محفوظة لدى مزوّد استضافة متخصص، ومحمية بصلاحيات وصول.</li>
          <li>لا يستطيع أي زائر قراءة الطلبات أو بيانات المستفيدين.</li>
          <li>يُوقف حساب أي عضو يغادر الجمعية فوراً.</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-bold">6. مدة الحفظ</h2>
        <p className="mt-3">
          نحتفظ بالبيانات طوال فترة التعامل مع الجمعية، وبالقدر اللازم لأرشيفها
          وتقاريرها ومتطلباتها القانونية.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-bold">7. حقوقك</h2>
        <p className="mt-3">
          يحق لك طلب الاطلاع على بياناتك، أو تصحيحها، أو حذفها، أو الاعتراض على
          معالجتها، وذلك بالتواصل معنا. وتخضع معالجة البيانات للتشريع الجزائري
          المتعلق بحماية الأشخاص الطبيعيين في مجال معالجة المعطيات ذات الطابع
          الشخصي.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-bold">8. التواصل</h2>
        <ul className="mt-3 space-y-1">
          {s.contact.phone && (
            <li>
              الهاتف: <span dir="ltr">{s.contact.phone}</span>
            </li>
          )}
          {s.contact.email && <li>البريد: {s.contact.email}</li>}
          {address && <li>العنوان: {address}</li>}
        </ul>
      </section>
    </article>
  );
}