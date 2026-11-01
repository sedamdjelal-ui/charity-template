"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

const inputClass =
  "w-full border border-ink bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-action";

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const data = new FormData(e.currentTarget);
    const supabase = createClient();

    const { error: authError } = await supabase.auth.signInWithPassword({
      email: String(data.get("email") || "").trim(),
      password: String(data.get("password") || ""),
    });

    if (authError) {
      setError("البريد الإلكتروني أو كلمة السر غير صحيحة.");
      setLoading(false);
      return;
    }

    router.replace("/admin");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="mb-2 block font-semibold">
          البريد الإلكتروني
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          dir="ltr"
          autoComplete="email"
          className={`${inputClass} text-right`}
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block font-semibold">
          كلمة السر
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          dir="ltr"
          autoComplete="current-password"
          className={`${inputClass} text-right`}
        />
      </div>

      {error && (
        <p className="border border-ink px-4 py-3 font-semibold">⚠ {error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-action py-4 font-semibold transition-colors hover:bg-action-hover disabled:opacity-60"
      >
        {loading ? "جاري الدخول..." : "دخول"}
      </button>
    </form>
  );
}