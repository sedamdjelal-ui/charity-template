"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "sending" | "success";
type NeedType = { value: string; label: string };

const inputClass =
  "w-full border border-ink bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-action";
const labelClass = "mb-2 block font-semibold";

export default function HelpForm({ needTypes }: { needTypes: NeedType[] }) {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const form = e.currentTarget;
    const data = new FormData(form);

    // حماية من الرسائل الآلية: هذا الحقل مخفي عن البشر
    if (data.get("website")) {
      setStatus("success");
      return;
    }

    const phone = String(data.get("phone") || "").replace(/\s/g, "");
    if (!/^0[0-9]{8,9}$/.test(phone)) {
      setError("رقم الهاتف غير صحيح. مثال: 0550123456");
      return;
    }

    const familySize = Number(data.get("family_size"));

    setStatus("sending");

    const supabase = createClient();
    const { error: dbError } = await supabase.from("help_requests").insert({
      full_name: String(data.get("full_name") || "").trim(),
      phone,
      wilaya: String(data.get("wilaya") || "").trim(),
      daira: String(data.get("daira") || "").trim(),
      commune: String(data.get("commune") || "").trim(),
      street: String(data.get("street") || "").trim() || null,
      family_size: familySize > 0 ? familySize : null,
      need_type: String(data.get("need_type") || ""),
      description: String(data.get("description") || "").trim() || null,
    });

    if (dbError) {
      setStatus("idle");
      setError("حدث خطأ أثناء الإرسال. تأكد من البيانات وحاول مرة أخرى.");
      return;
    }

    form.reset();
    setStatus("success");
  }

  if (status === "success") {
    return (
      <div className="border border-ink p-8 text-center">
        <h2 className="font-heading text-3xl font-bold">تم استلام طلبك ✓</h2>
        <p className="mt-4 leading-loose text-muted">
          شكراً لك. سيتواصل معك أحد أعضاء الجمعية عبر الهاتف لدراسة طلبك.
          يُرجى تحضير الوثائق المطلوبة.
        </p>
        <Link
          href="/"
          className="mt-8 inline-block border border-ink px-6 py-3 font-semibold transition-colors hover:bg-ink hover:text-white"
        >
          العودة للرئيسية
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* حقل مخفي ضد الرسائل الآلية */}
      <div className="hidden" aria-hidden="true">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="full_name" className={labelClass}>
            الاسم واللقب *
          </label>
          <input
            id="full_name"
            name="full_name"
            required
            minLength={3}
            maxLength={100}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            رقم الهاتف *
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            dir="ltr"
            placeholder="0550123456"
            className={`${inputClass} text-right`}
          />
        </div>
      </div>

      <div className="grid gap-6 sm:grid-cols-3">
        <div>
          <label htmlFor="wilaya" className={labelClass}>
            الولاية *
          </label>
          <input id="wilaya" name="wilaya" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="daira" className={labelClass}>
            الدائرة *
          </label>
          <input id="daira" name="daira" required className={inputClass} />
        </div>
        <div>
          <label htmlFor="commune" className={labelClass}>
            البلدية *
          </label>
          <input id="commune" name="commune" required className={inputClass} />
        </div>
      </div>

      <div>
        <label htmlFor="street" className={labelClass}>
          العنوان التفصيلي (الحي، الشارع)
        </label>
        <input id="street" name="street" maxLength={200} className={inputClass} />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="need_type" className={labelClass}>
            نوع المساعدة المطلوبة *
          </label>
          <select
            id="need_type"
            name="need_type"
            required
            defaultValue=""
            className={inputClass}
          >
            <option value="" disabled>
              اختر نوع المساعدة
            </option>
            {needTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="family_size" className={labelClass}>
            عدد أفراد العائلة
          </label>
          <input
            id="family_size"
            name="family_size"
            type="number"
            min={1}
            max={30}
            className={inputClass}
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          اشرح وضعيتك باختصار
        </label>
        <textarea
          id="description"
          name="description"
          rows={5}
          maxLength={1000}
          className={inputClass}
        />
      </div>

      <label className="flex items-start gap-3">
        <input type="checkbox" required className="mt-1 h-5 w-5 accent-ink" />
        <span className="text-muted">
          أوافق على أن تُستعمل بياناتي لدراسة طلبي فقط، ولا تُنشر أو تُشارك مع أي
          جهة أخرى.
        </span>
      </label>

      {error && (
        <p className="border border-ink bg-white px-4 py-3 font-semibold">
          ⚠ {error}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full bg-action py-4 font-semibold transition-colors hover:bg-action-hover disabled:opacity-60"
      >
        {status === "sending" ? "جاري الإرسال..." : "إرسال الطلب"}
      </button>
    </form>
  );
}