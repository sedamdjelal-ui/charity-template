"use client";

import { useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Settings } from "@/lib/settings";
import { refreshSettings } from "@/app/admin/actions";

type Stat = { value: string; label: string };

const inputClass =
  "w-full border border-ink bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-action";

function Field({
  label,
  name,
  defaultValue,
  ltr = false,
  required = false,
  multiline = false,
  rows = 3,
  maxLength,
  hint,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  ltr?: boolean;
  required?: boolean;
  multiline?: boolean;
  rows?: number;
  maxLength?: number;
  hint?: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="mb-2 block font-semibold">
        {label}
        {required && " *"}
      </label>
      {multiline ? (
        <textarea
          id={name}
          name={name}
          rows={rows}
          maxLength={maxLength}
          defaultValue={defaultValue}
          className={inputClass}
        />
      ) : (
        <input
          id={name}
          name={name}
          required={required}
          maxLength={maxLength}
          dir={ltr ? "ltr" : undefined}
          defaultValue={defaultValue}
          className={`${inputClass} ${ltr ? "text-right" : ""}`}
        />
      )}
      {hint && <p className="mt-1 text-sm text-muted">{hint}</p>}
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="border border-ink p-5">
      <legend className="px-2 font-heading text-xl font-bold">{title}</legend>
      <div className="mt-2 space-y-5">{children}</div>
    </fieldset>
  );
}

function toLocalPhone(whatsapp: string) {
  return whatsapp.startsWith("213") ? `0${whatsapp.slice(3)}` : whatsapp;
}

function toWhatsapp(phone: string) {
  const digits = phone.replace(/\D/g, "");
  return digits.startsWith("0") ? `213${digits.slice(1)}` : digits;
}

export default function SettingsPanel({
  supabase,
}: {
  supabase: SupabaseClient;
}) {
  const [settings, setSettings] = useState<Settings | null>(null);
  const [stats, setStats] = useState<Stat[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    async function load() {
      const { data, error: dbError } = await supabase
        .from("site_settings")
        .select("data")
        .eq("id", 1)
        .single();

      if (dbError || !data) {
        setError("تعذّر تحميل الإعدادات.");
      } else {
        const s = data.data as Settings;
        setSettings(s);
        setStats(s.stats ?? []);
      }
      setLoading(false);
    }
    load();
  }, [supabase]);

  function updateStat(index: number, key: keyof Stat, value: string) {
    setStats((prev) =>
      prev.map((s, i) => (i === index ? { ...s, [key]: value } : s))
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!settings) return;

    setMessage("");
    setError("");

    const d = new FormData(e.currentTarget);
    const get = (key: string) => String(d.get(key) ?? "").trim();

    const newData: Settings = {
      ...settings,
      name: get("name"),
      type: get("type"),
      fullName: get("fullName"),
      tagline: get("tagline"),
      intro: get("intro"),
      approval: {
        number: get("approval_number"),
        authority: get("approval_authority"),
      },
      address: {
        wilaya: get("wilaya"),
        daira: get("daira"),
        commune: get("commune"),
        street: get("street"),
      },
      contact: {
        phone: get("phone"),
        whatsapp: toWhatsapp(get("whatsapp")),
        email: get("email"),
        facebook: get("facebook"),
      },
      donation: {
        ccp: get("ccp"),
        rip: get("rip"),
        accountName: get("accountName"),
      },
      about: {
        story: get("story"),
        vision: get("vision"),
        mission: get("mission"),
        foundedYear: get("foundedYear"),
      },
      help: {
        intro: get("help_intro"),
        documents: get("help_documents")
          .split("\n")
          .map((line) => line.trim())
          .filter(Boolean),
      },
      stats: stats
        .map((s) => ({ value: s.value.trim(), label: s.label.trim() }))
        .filter((s) => s.value && s.label),
    };

    if (!newData.name || !newData.fullName) {
      setError("اسم الجمعية واسمها الكامل مطلوبان.");
      return;
    }

    setSaving(true);

    const { error: dbError } = await supabase
      .from("site_settings")
      .update({ data: newData, updated_at: new Date().toISOString() })
      .eq("id", 1);

    if (dbError) {
      setSaving(false);
      setError("تعذّر حفظ الإعدادات. حاول مرة أخرى.");
      return;
    }

    await refreshSettings();

    setSettings(newData);
    setSaving(false);
    setMessage("تم حفظ الإعدادات ✓ التعديلات ظاهرة الآن في الموقع.");
  }

  if (loading) {
    return (
      <p className="py-12 text-center text-muted">جاري تحميل الإعدادات...</p>
    );
  }

  if (!settings) {
    return (
      <p className="border border-ink px-4 py-3 font-semibold">⚠ {error}</p>
    );
  }

  const s = settings;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Section title="هوية الجمعية">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="الاسم المختصر" name="name" defaultValue={s.name} required maxLength={40} hint="يظهر في رأس الموقع، مثل: يد العون" />
          <Field label="نوع الجمعية" name="type" defaultValue={s.type} maxLength={40} hint="مثل: جمعية خيرية" />
        </div>
        <Field label="الاسم الكامل" name="fullName" defaultValue={s.fullName} required maxLength={100} />
        <Field label="الشعار النصي (العنوان الكبير)" name="tagline" defaultValue={s.tagline} maxLength={120} />
        <Field label="نبذة قصيرة" name="intro" defaultValue={s.intro} multiline maxLength={400} />
      </Section>

      <Section title="الاعتماد الرسمي">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="رقم الاعتماد" name="approval_number" defaultValue={s.approval?.number} ltr maxLength={40} />
          <Field label="الجهة المانحة" name="approval_authority" defaultValue={s.approval?.authority} maxLength={80} />
        </div>
      </Section>

      <Section title="العنوان">
        <div className="grid gap-5 sm:grid-cols-3">
          <Field label="الولاية" name="wilaya" defaultValue={s.address?.wilaya} maxLength={60} />
          <Field label="الدائرة" name="daira" defaultValue={s.address?.daira} maxLength={60} />
          <Field label="البلدية" name="commune" defaultValue={s.address?.commune} maxLength={60} />
        </div>
        <Field label="الشارع ورقم المقر" name="street" defaultValue={s.address?.street} maxLength={150} />
      </Section>

      <Section title="التواصل">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="رقم الهاتف" name="phone" defaultValue={s.contact?.phone} ltr maxLength={20} />
          <Field label="رقم واتساب" name="whatsapp" defaultValue={toLocalPhone(s.contact?.whatsapp ?? "")} ltr maxLength={20} hint="اكتبه عادياً مثل 0550123456" />
          <Field label="البريد الإلكتروني" name="email" defaultValue={s.contact?.email} ltr maxLength={100} />
          <Field label="رابط صفحة فيسبوك" name="facebook" defaultValue={s.contact?.facebook} ltr maxLength={200} hint="اتركه فارغاً لإخفائه" />
        </div>
      </Section>

      <Section title="حساب التبرعات">
        <Field label="اسم صاحب الحساب" name="accountName" defaultValue={s.donation?.accountName} maxLength={100} />
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="الحساب البريدي CCP" name="ccp" defaultValue={s.donation?.ccp} ltr maxLength={40} />
          <Field label="رقم RIP" name="rip" defaultValue={s.donation?.rip} ltr maxLength={30} />
        </div>
      </Section>

      <Section title="من نحن">
        <Field label="سنة التأسيس" name="foundedYear" defaultValue={s.about?.foundedYear} ltr maxLength={4} />
        <Field label="قصة الجمعية" name="story" defaultValue={s.about?.story} multiline rows={5} maxLength={1200} />
        <Field label="الرؤية" name="vision" defaultValue={s.about?.vision} multiline rows={2} maxLength={300} />
        <Field label="الرسالة" name="mission" defaultValue={s.about?.mission} multiline rows={2} maxLength={300} />
      </Section>

      <Section title="طلب المساعدة">
        <Field label="نص التعريف" name="help_intro" defaultValue={s.help?.intro} multiline maxLength={500} />
        <Field
          label="الوثائق المطلوبة"
          name="help_documents"
          defaultValue={(s.help?.documents ?? []).join("\n")}
          multiline
          rows={6}
          hint="كل وثيقة في سطر مستقل"
        />
      </Section>

      <Section title="أرقام الأثر">
        <p className="text-sm text-muted">
          تظهر تحت القسم الترحيبي. ننصح بـ 4 أرقام.
        </p>
        {stats.map((stat, i) => (
          <div key={i} className="flex gap-3">
            <input
              value={stat.value}
              onChange={(e) => updateStat(i, "value", e.target.value)}
              placeholder="الرقم"
              dir="ltr"
              maxLength={12}
              className={`${inputClass} w-32 shrink-0 text-right`}
            />
            <input
              value={stat.label}
              onChange={(e) => updateStat(i, "label", e.target.value)}
              placeholder="الوصف، مثل: عائلة مستفيدة"
              maxLength={40}
              className={inputClass}
            />
            <button
              type="button"
              onClick={() => setStats((prev) => prev.filter((_, j) => j !== i))}
              className="shrink-0 border border-ink px-4 font-semibold btn-outline"
            >
              حذف
            </button>
          </div>
        ))}
        {stats.length < 4 && (
          <button
            type="button"
            onClick={() => setStats((prev) => [...prev, { value: "", label: "" }])}
            className="border border-ink px-4 py-2 font-semibold btn-outline"
          >
            + إضافة رقم
          </button>
        )}
      </Section>

      {/* شريط الحفظ */}
      <div className="sticky bottom-0 border-t border-ink bg-white py-4">
        {error && <p className="mb-3 font-semibold">⚠ {error}</p>}
        {message && <p className="mb-3 font-semibold">{message}</p>}
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-action py-4 font-semibold transition-colors hover:bg-action-hover disabled:opacity-60"
        >
          {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </button>
      </div>
    </form>
  );
}