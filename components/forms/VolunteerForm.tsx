"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

type Status = "idle" | "sending" | "success";

const inputClass =
  "w-full border border-ink bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-action";
const labelClass = "mb-2 block font-semibold";

const skillOptions = [
  "التوزيع الميداني",
  "التنظيم والإدارة",
  "التصوير والتوثيق",
  "النقل والسياقة",
  "التمريض والإسعاف",
  "التعليم والدعم المدرسي",
];

const availabilityOptions = [
  "أيام الأسبوع",
  "عطلة نهاية الأسبوع",
  "المساء فقط",
  "حسب الحملات",
];

export default function VolunteerForm() {
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

    const selectedSkills = data.getAll("skills").map(String);
    const otherSkills = String(data.get("other_skills") || "").trim();
    if (otherSkills) selectedSkills.push(otherSkills);

    setStatus("sending");

    const supabase = createClient();
    const { error: dbError } = await supabase.from("volunteers").insert({
      full_name: String(data.get("full_name") || "").trim(),
      phone,
      wilaya: String(data.get("wilaya") || "").trim(),
      daira: String(data.get("daira") || "").trim(),
      commune: String(data.get("commune") || "").trim(),
      skills: selectedSkills.length ? selectedSkills.join("، ") : null,
      availability: String(data.get("availability") || "") || null,
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
        <h2 className="font-heading text-3xl font-bold">
          شكراً لانضمامك إلينا ✓
        </h2>
        <p className="mt-4 leading-loose text-muted">
          تم تسجيلك كمتطوع. سيتواصل معك أحد أعضاء الجمعية قبل الحملة القادمة.
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

      <fieldset>
        <legend className={labelClass}>في ماذا يمكنك المساعدة؟</legend>
        <div className="grid gap-3 sm:grid-cols-2">
          {skillOptions.map((skill) => (
            <label
              key={skill}
              className="flex items-center gap-3 border border-line px-4 py-3"
            >
              <input
                type="checkbox"
                name="skills"
                value={skill}
                className="h-5 w-5 accent-ink"
              />
              <span>{skill}</span>
            </label>
          ))}
        </div>
        <input
          name="other_skills"
          maxLength={150}
          placeholder="مهارات أخرى (اختياري)"
          className={`${inputClass} mt-3`}
        />
      </fieldset>

      <div>
        <label htmlFor="availability" className={labelClass}>
          متى تكون متاحاً؟
        </label>
        <select
          id="availability"
          name="availability"
          defaultValue=""
          className={inputClass}
        >
          <option value="">اختر</option>
          {availabilityOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <label className="flex items-start gap-3">
        <input type="checkbox" required className="mt-1 h-5 w-5 accent-ink" />
        <span className="text-muted">
          أوافق على أن تتواصل معي الجمعية بخصوص أنشطة التطوع، ولا تُشارك بياناتي
          مع أي جهة أخرى.
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
        {status === "sending" ? "جاري الإرسال..." : "سجّلني كمتطوع"}
      </button>
    </form>
  );
}