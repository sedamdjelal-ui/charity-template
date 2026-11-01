"use client";

import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_SIZE = 3 * 1024 * 1024; // 3 ميغابايت
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export default function ImageUpload({
  supabase,
  folder,
  value,
  onChange,
  hint,
}: {
  supabase: SupabaseClient;
  folder: string;
  value: string | null;
  onChange: (url: string | null) => void;
  hint?: string;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setError("");

    if (!ALLOWED.includes(file.type)) {
      setError("نوع الصورة غير مقبول. استعمل JPG أو PNG أو WebP.");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("حجم الصورة أكبر من 3 ميغابايت. صغّرها ثم أعد المحاولة.");
      return;
    }

    setUploading(true);

    const ext = file.type.split("/")[1].replace("jpeg", "jpg");
    const path = `${folder}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("site")
      .upload(path, file, { contentType: file.type });

    setUploading(false);

    if (uploadError) {
      setError("تعذّر رفع الصورة. حاول مرة أخرى.");
      return;
    }

    const { data } = supabase.storage.from("site").getPublicUrl(path);
    onChange(data.publicUrl);
  }

  return (
    <div>
      {value && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={value}
          alt=""
          className="mb-3 h-48 w-full border border-ink object-cover"
        />
      )}

      <div className="flex flex-wrap gap-3">
        <label className="btn-outline cursor-pointer border border-ink px-5 py-2 font-semibold">
          {uploading ? "جاري الرفع..." : value ? "تغيير الصورة" : "رفع صورة"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFile}
            disabled={uploading}
            className="hidden"
          />
        </label>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="btn-outline border border-ink px-5 py-2 font-semibold"
          >
            إزالة الصورة
          </button>
        )}
      </div>

      {hint && <p className="mt-2 text-sm text-muted">{hint}</p>}
      {error && <p className="mt-2 text-sm font-semibold">⚠ {error}</p>}
    </div>
  );
}