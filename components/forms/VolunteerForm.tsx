"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import AddressFields from "@/components/forms/AddressFields";

type Status = "idle" | "sending" | "success";
type Errors = Partial<
  Record<"full_name" | "phone" | "wilaya" | "daira" | "commune" | "consent", string>
>;

const labelClass = "mb-2 block font-semibold";

function inputClass(hasError: boolean) {
  return `w-full bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-action ${
    hasError ? "border-2 border-ink" : "border border-ink"
  }`;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm font-semibold">⚠ {message}</p>;
}

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
  const [errors, setErrors] = useState<Errors>({});
  const [submitError, setSubmitError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitError("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const get = (key: string) => String(data.get(key) ?? "").trim();

    // حماية من الرسائل الآلية: هذا الحقل مخفي عن البشر
    if (get("website")) {
      setStatus("success");
      return;
    }

    const selectedSkills = data.getAll("skills").map(String);
    const otherSkills = get("other_skills");
    if (otherSkills) selectedSkills.push(otherSkills);

    const values = {
      full_name: get("full_name"),
      phone: get("phone").replace(/\s/g, ""),
      wilaya: get("wilaya"),
      daira: get("daira"),
      commune: get("commune"),
      skills: selectedSkills.length ? selectedSkills.join("، ") : null,
      availability: get("availability") || null,
    };

    const found: Errors = {};
    if (values.full_name.length < 3) {
      found.full_name = "اكتب الاسم واللقب (3 أحرف على الأقل).";
    }
    if (!/^0[0-9]{8,9}$/.test(values.phone)) {
      found.phone = "رقم الهاتف غير صحيح. مثال: 0550123456";
    }
    if (!values.wilaya) found.wilaya = "اختر الولاية.";
    if (!values.daira) found.daira = "اختر الدائرة.";
    if (!values.commune) found.commune = "اختر البلدية.";
    if (!data.get("consent")) {
      found.consent = "يجب الموافقة لإتمام التسجيل.";
    }

    setErrors(found);
    if (Object.keys(found).length > 0) {
      document.getElementById(Object.keys(found)[0])?.focus();
      return;
    }

    setStatus("sending");

    const supabase = createClient();
    const { error: dbError } = await supabase.from("volunteers").insert(values);

    if (dbError) {
      setStatus("idle");
      setSubmitError("حدث خطأ أثناء الإرسال. حاول مرة أخرى.");
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
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      {/* حقل مخفي ضد الرسائل الآلية */}
      <div className="hidden" aria-hidden="true">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      {Object.keys(errors).length > 0 && (
        <p className="border border-ink px-4 py-3 font-semibold">
          ⚠ توجد أخطاء في النموذج، صحّحها ثم أعد الإرسال.
        </p>
      )}

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="full_name" className={labelClass}>
            الاسم واللقب *
          </label>
          <input
            id="full_name"
            name="full_name"
            maxLength={100}
            aria-invalid={!!errors.full_name}
            className={inputClass(!!errors.full_name)}
          />
          <FieldError message={errors.full_name} />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            رقم الهاتف *
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            dir="ltr"
            maxLength={13}
            placeholder="0550123456"
            aria-invalid={!!errors.phone}
            className={`${inputClass(!!errors.phone)} text-right`}
          />
          <FieldError message={errors.phone} />
        </div>
      </div>

      <AddressFields
        errors={{
          wilaya: errors.wilaya,
          daira: errors.daira,
          commune: errors.commune,
        }}
        inputClass={inputClass}
        labelClass={labelClass}
      />

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
          className={`${inputClass(false)} mt-3`}
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
          className={inputClass(false)}
        >
          <option value="">اختر</option>
          {availabilityOptions.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="flex items-start gap-3">
          <input
            id="consent"
            name="consent"
            type="checkbox"
            className="mt-1 h-5 w-5 accent-ink"
          />
          <span className="text-muted">
            أوافق على أن تتواصل معي الجمعية بخصوص أنشطة التطوع، ولا تُشارك
            بياناتي مع أي جهة أخرى.
          </span>
        </label>
        <FieldError message={errors.consent} />
      </div>

      {submitError && (
        <p className="border border-ink bg-white px-4 py-3 font-semibold">
          ⚠ {submitError}
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