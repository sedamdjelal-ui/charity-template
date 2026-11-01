"use client";

import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

const inputClass =
  "w-full border border-ink bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-action";
const labelClass = "mb-2 block font-semibold";

export default function AccountPanel({
  supabase,
  me,
}: {
  supabase: SupabaseClient;
  me: { fullName: string; email: string; role: "president" | "member" };
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    const form = e.currentTarget;
    const d = new FormData(form);
    const password = String(d.get("password") || "");
    const confirm = String(d.get("confirm") || "");

    if (password.length < 8) {
      setError("كلمة السر 8 أحرف على الأقل.");
      return;
    }
    if (password !== confirm) {
      setError("كلمتا السر غير متطابقتين.");
      return;
    }

    setSaving(true);
    const { error: authError } = await supabase.auth.updateUser({ password });
    setSaving(false);

    if (authError) {
      setError(
        "تعذّر تغيير كلمة السر. تأكد أنها مختلفة عن كلمة السر الحالية."
      );
      return;
    }

    form.reset();
    setMessage("تم تغيير كلمة السر ✓ استعملها في المرة القادمة.");
  }

  return (
    <div className="max-w-xl">
      <div className="border border-ink p-5">
        <p className="font-heading text-2xl font-bold">{me.fullName}</p>
        <p className="mt-1 text-muted" dir="ltr">
          {me.email}
        </p>
        <p className="mt-2 font-semibold">
          {me.role === "president" ? "رئيس الجمعية" : "عضو"}
        </p>
      </div>

      <h3 className="mt-10 font-heading text-2xl font-bold">تغيير كلمة السر</h3>

      <form onSubmit={handleSubmit} noValidate className="mt-4 space-y-5">
        <div>
          <label htmlFor="password" className={labelClass}>
            كلمة السر الجديدة
          </label>
          <input
            id="password"
            name="password"
            type="password"
            dir="ltr"
            autoComplete="new-password"
            className={`${inputClass} text-right`}
          />
          <p className="mt-1 text-sm text-muted">8 أحرف على الأقل.</p>
        </div>

        <div>
          <label htmlFor="confirm" className={labelClass}>
            أعد كتابتها
          </label>
          <input
            id="confirm"
            name="confirm"
            type="password"
            dir="ltr"
            autoComplete="new-password"
            className={`${inputClass} text-right`}
          />
        </div>

        {error && (
          <p className="border border-ink px-4 py-3 font-semibold">⚠ {error}</p>
        )}
        {message && (
          <p className="border border-ink bg-action px-4 py-3 font-semibold">
            {message}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="bg-action px-6 py-3 font-semibold transition-colors hover:bg-action-hover disabled:opacity-60"
        >
          {saving ? "جاري الحفظ..." : "تغيير كلمة السر"}
        </button>
      </form>
    </div>
  );
}