import type { Metadata } from "next";
import Link from "next/link";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = {
  title: "شروط الاستخدام",
};

const LAST_UPDATED = "نوفمبر 2026";

export default async function TermsPage() {
  const s = await getSettings();

  return (
    <article className="mx-auto max-w-3xl px-4 py-16 leading-loose">
      <h1 className="font-heading text-4xl font-bold">شروط الاستخدام</h1>
      <span className="mt-4 block h-px w-16 bg-ink" />
      <p className="mt-4 text-sm text-muted">آخر تحديث: {LAST_UPDATED}</p>

      <p className="mt-8">
        باستعمالك موقع {s.fullName}، فإنك توافق على هذه الشروط. إذا كنت لا
        توافق عليها، يُرجى عدم استعمال الموقع.
      </p>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-bold">1. الغرض من الموقع</h2>
        <p className="mt-3">
          يعرّف الموقع بالجمعية ونشاطاتها وحملاتها، ويتيح طلب المساعدة والتسجيل
          في التطوع، ويوضّح طريقة التبرع.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-bold">2. التبرعات</h2>
        <ul className="mt-3 list-inside list-disc space-y-2">
          <li>
            تتم التبرعات بالتحويل المباشر إلى حساب الجمعية الرسمي
            {s.donation.accountName && ` باسم: ${s.donation.accountName}`}.
          </li>
          <li>تأكد من اسم صاحب الحساب قبل أي تحويل.</li>
          <li>
            الموقع لا يستقبل الأموال ولا يحفظ أي معلومات بنكية. يُرجى عدم إرسال
            معلومات بطاقتك لأي شخص يدّعي تمثيل الجمعية.
          </li>
          <li>
            تُصرف التبرعات في نشاطات الجمعية وحملاتها، وفق قانونها الأساسي.
          </li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-bold">3. طلب المساعدة</h2>
        <ul className="mt-3 list-inside list-disc space-y-2">
          <li>
            إرسال الطلب لا يعني قبوله. تدرس الجمعية كل طلب حسب إمكانياتها
            ومعاييرها.
          </li>
          <li>يجب أن تكون المعلومات المقدّمة صحيحة وكاملة.</li>
          <li>يُرفض أي طلب يتضح أنه يحتوي على معلومات كاذبة.</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-bold">4. التطوع</h2>
        <p className="mt-3">
          التسجيل كمتطوع لا يُلزم الجمعية ولا المتطوع بأي التزام. تتواصل
          الجمعية مع المتطوعين حسب حاجة نشاطاتها.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-bold">5. الاستعمال الممنوع</h2>
        <ul className="mt-3 list-inside list-disc space-y-2">
          <li>إرسال طلبات وهمية أو باسم شخص آخر دون علمه.</li>
          <li>محاولة الدخول إلى لوحة الإدارة دون تخويل.</li>
          <li>أي استعمال يضر بالجمعية أو بالمستفيدين.</li>
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-bold">6. البيانات الشخصية</h2>
        <p className="mt-3">
          تخضع البيانات التي ترسلها عبر الموقع لـ{" "}
          <Link href="/privacy" className="underline">
            سياسة الخصوصية
          </Link>
          .
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-bold">7. تعديل الشروط</h2>
        <p className="mt-3">
          يحق للجمعية تعديل هذه الشروط، ويُعمل بالنسخة المنشورة في هذه الصفحة.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="font-heading text-2xl font-bold">8. القانون المطبّق</h2>
        <p className="mt-3">تخضع هذه الشروط للقانون الجزائري.</p>
      </section>
    </article>
  );
}