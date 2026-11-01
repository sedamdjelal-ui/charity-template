"use client";

import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

type NewsItem = {
  id: string;
  title: string;
  excerpt: string | null;
  published_at: string;
  published: boolean;
};

type NewsInput = Omit<NewsItem, "id">;

const inputClass =
  "w-full border border-ink bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-action";
const labelClass = "mb-2 block font-semibold";

function today() {
  return new Date().toISOString().slice(0, 10);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("ar-DZ", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function NewsForm({
  initial,
  saving,
  onSave,
  onCancel,
}: {
  initial: NewsInput;
  saving: boolean;
  onSave: (values: NewsInput) => void;
  onCancel: () => void;
}) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    onSave({
      title: String(d.get("title") || "").trim(),
      excerpt: String(d.get("excerpt") || "").trim() || null,
      published_at: String(d.get("published_at") || today()),
      published: d.get("published") === "on",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 border-2 border-ink p-5">
      <div>
        <label htmlFor="title" className={labelClass}>
          عنوان الخبر *
        </label>
        <input
          id="title"
          name="title"
          required
          minLength={3}
          maxLength={150}
          defaultValue={initial.title}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="excerpt" className={labelClass}>
          نص الخبر
        </label>
        <textarea
          id="excerpt"
          name="excerpt"
          rows={4}
          maxLength={600}
          defaultValue={initial.excerpt ?? ""}
          className={inputClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="published_at" className={labelClass}>
            تاريخ الخبر *
          </label>
          <input
            id="published_at"
            name="published_at"
            type="date"
            required
            defaultValue={initial.published_at}
            className={inputClass}
          />
        </div>
        <label className="flex items-center gap-3 sm:mt-9">
          <input
            type="checkbox"
            name="published"
            defaultChecked={initial.published}
            className="h-5 w-5 accent-ink"
          />
          <span>منشور في الموقع</span>
        </label>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-action px-6 py-3 font-semibold transition-colors hover:bg-action-hover disabled:opacity-60"
        >
          {saving ? "جاري الحفظ..." : "حفظ"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border border-ink px-6 py-3 font-semibold transition-colors hover:bg-ink hover:text-white"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}

export default function NewsPanel({ supabase }: { supabase: SupabaseClient }) {
  const [loading, setLoading] = useState(true);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadNews = useCallback(async () => {
    const { data, error: dbError } = await supabase
      .from("news")
      .select("id, title, excerpt, published_at, published")
      .order("published_at", { ascending: false });

    if (dbError) {
      setError("تعذّر تحميل الأخبار.");
    } else {
      setError("");
      setNews((data ?? []) as NewsItem[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadNews();
  }, [loadNews]);

  async function handleSave(values: NewsInput) {
    setSaving(true);
    setError("");

    const { error: dbError } =
      editingId === "new"
        ? await supabase.from("news").insert(values)
        : await supabase.from("news").update(values).eq("id", editingId);

    setSaving(false);

    if (dbError) {
      setError("تعذّر الحفظ. تأكد أن العنوان 3 أحرف على الأقل.");
      return;
    }

    setEditingId(null);
    await loadNews();
  }

  async function togglePublished(item: NewsItem) {
    const { error: dbError } = await supabase
      .from("news")
      .update({ published: !item.published })
      .eq("id", item.id);

    if (dbError) {
      setError("تعذّر تغيير حالة النشر.");
      return;
    }
    await loadNews();
  }

  async function handleDelete(item: NewsItem) {
    const confirmed = window.confirm(
      `هل تريد حذف خبر «${item.title}» نهائياً؟`
    );
    if (!confirmed) return;

    const { error: dbError } = await supabase
      .from("news")
      .delete()
      .eq("id", item.id);

    if (dbError) {
      setError("تعذّر حذف الخبر.");
      return;
    }
    await loadNews();
  }

  if (loading) {
    return <p className="py-12 text-center text-muted">جاري تحميل الأخبار...</p>;
  }

  return (
    <div>
      {/* الأزرار العلوية */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setEditingId("new")}
          disabled={editingId !== null}
          className="bg-action px-5 py-2 font-semibold transition-colors hover:bg-action-hover disabled:opacity-60"
        >
          + إضافة خبر
        </button>
        <button
          type="button"
          onClick={loadNews}
          className="ms-auto border border-ink px-4 py-2 text-sm font-semibold transition-colors hover:bg-ink hover:text-white"
        >
          تحديث ⟳
        </button>
      </div>

      <p className="mt-4 text-sm text-muted">
        يظهر في الصفحة الرئيسية آخر 3 أخبار منشورة.
      </p>

      {error && (
        <p className="mt-6 border border-ink px-4 py-3 font-semibold">⚠ {error}</p>
      )}

      <div className="mt-6 space-y-4">
        {editingId === "new" && (
          <NewsForm
            initial={{
              title: "",
              excerpt: "",
              published_at: today(),
              published: true,
            }}
            saving={saving}
            onSave={handleSave}
            onCancel={() => setEditingId(null)}
          />
        )}

        {news.length === 0 && editingId !== "new" && (
          <p className="border border-line py-12 text-center text-muted">
            لا توجد أخبار بعد. اضغط «إضافة خبر» للبدء.
          </p>
        )}

        {news.map((item) => {
          if (editingId === item.id) {
            return (
              <NewsForm
                key={item.id}
                initial={item}
                saving={saving}
                onSave={handleSave}
                onCancel={() => setEditingId(null)}
              />
            );
          }

          return (
            <article
              key={item.id}
              className={`border border-ink p-5 ${
                item.published ? "" : "opacity-60"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-heading text-xl font-bold">
                    {item.title}
                  </h3>
                  <p className="text-sm text-muted">
                    {formatDate(item.published_at)} ·{" "}
                    {item.published ? "منشور" : "مخفي"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingId(item.id)}
                    disabled={editingId !== null}
                    className="border border-ink px-4 py-2 text-sm font-semibold transition-colors hover:bg-ink hover:text-white disabled:opacity-60"
                  >
                    تعديل
                  </button>
                  <button
                    type="button"
                    onClick={() => togglePublished(item)}
                    disabled={editingId !== null}
                    className="border border-ink px-4 py-2 text-sm font-semibold transition-colors hover:bg-ink hover:text-white disabled:opacity-60"
                  >
                    {item.published ? "إخفاء" : "نشر"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(item)}
                    disabled={editingId !== null}
                    className="border border-ink px-4 py-2 text-sm font-semibold transition-colors hover:bg-ink hover:text-white disabled:opacity-60"
                  >
                    حذف
                  </button>
                </div>
              </div>

              {item.excerpt && (
                <p className="mt-4 border-t border-line pt-4 leading-relaxed text-muted">
                  {item.excerpt}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}