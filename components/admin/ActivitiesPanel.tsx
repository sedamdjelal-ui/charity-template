"use client";

import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import ImageUpload from "@/components/admin/ImageUpload";

type Activity = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  details: string | null;
  image: string | null;
  enabled: boolean;
  sort_order: number;
};

type ActivityInput = Omit<Activity, "id" | "slug">;

const inputClass =
  "w-full border border-ink bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-action";
const labelClass = "mb-2 block font-semibold";

function newSlug() {
  return `act-${Date.now().toString(36)}`;
}

function ActivityForm({
  supabase,
  initial,
  saving,
  onSave,
  onCancel,
}: {
  supabase: SupabaseClient;
  initial: ActivityInput;
  saving: boolean;
  onSave: (values: ActivityInput) => void;
  onCancel: () => void;
}) {
  const [image, setImage] = useState<string | null>(initial.image);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    onSave({
      title: String(d.get("title") || "").trim(),
      description: String(d.get("description") || "").trim() || null,
      details: String(d.get("details") || "").trim() || null,
      image,
      sort_order: Number(d.get("sort_order")) || 0,
      enabled: d.get("enabled") === "on",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 border-2 border-ink p-5">
      <div className="grid gap-5 sm:grid-cols-3">
        <div className="sm:col-span-2">
          <label htmlFor="title" className={labelClass}>
            اسم النشاط *
          </label>
          <input
            id="title"
            name="title"
            required
            minLength={2}
            maxLength={80}
            defaultValue={initial.title}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="sort_order" className={labelClass}>
            الترتيب
          </label>
          <input
            id="sort_order"
            name="sort_order"
            type="number"
            dir="ltr"
            defaultValue={initial.sort_order}
            className={`${inputClass} text-right`}
          />
        </div>
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          وصف قصير
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={400}
          defaultValue={initial.description ?? ""}
          className={inputClass}
        />
        <p className="mt-1 text-sm text-muted">
          يظهر في خانة النشاط في الصفحة الرئيسية.
        </p>
      </div>

      <div>
        <label htmlFor="details" className={labelClass}>
          التفاصيل الكاملة
        </label>
        <textarea
          id="details"
          name="details"
          rows={8}
          maxLength={5000}
          defaultValue={initial.details ?? ""}
          className={inputClass}
        />
        <p className="mt-1 text-sm text-muted">
          تظهر في صفحة النشاط. اترك سطراً فارغاً بين الفقرات.
        </p>
      </div>

      <div>
        <p className={labelClass}>صورة النشاط</p>
        <ImageUpload
          supabase={supabase}
          folder="activities"
          value={image}
          onChange={setImage}
          hint="اختيارية. تجنّب صور وجوه المستفيدين، خاصة الأطفال. بعد الرفع اضغط «حفظ»."
        />
      </div>

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          name="enabled"
          defaultChecked={initial.enabled}
          className="h-5 w-5 accent-ink"
        />
        <span>ظاهر في الموقع وفي نموذج طلب المساعدة</span>
      </label>

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
          className="border border-ink px-6 py-3 font-semibold btn-outline"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}

export default function ActivitiesPanel({
  supabase,
}: {
  supabase: SupabaseClient;
}) {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadActivities = useCallback(async () => {
    const { data, error: dbError } = await supabase
      .from("activities")
      .select("id, slug, title, description, details, image, enabled, sort_order")
      .order("sort_order", { ascending: true });

    if (dbError) {
      setError("تعذّر تحميل النشاطات.");
    } else {
      setError("");
      setActivities((data ?? []) as Activity[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  async function handleSave(values: ActivityInput) {
    setSaving(true);
    setError("");

    const { error: dbError } =
      editingId === "new"
        ? await supabase
            .from("activities")
            .insert({ ...values, slug: newSlug() })
        : await supabase.from("activities").update(values).eq("id", editingId);

    setSaving(false);

    if (dbError) {
      setError("تعذّر الحفظ. تأكد أن اسم النشاط حرفان على الأقل.");
      return;
    }

    setEditingId(null);
    await loadActivities();
  }

  async function toggleEnabled(activity: Activity) {
    const { error: dbError } = await supabase
      .from("activities")
      .update({ enabled: !activity.enabled })
      .eq("id", activity.id);

    if (dbError) {
      setError("تعذّر تغيير حالة الظهور.");
      return;
    }
    await loadActivities();
  }

  async function handleDelete(activity: Activity) {
    const confirmed = window.confirm(
      `هل تريد حذف نشاط «${activity.title}» نهائياً؟\n\nطلبات المساعدة القديمة من هذا النوع لن يظهر اسم نوعها بشكل صحيح. ننصح باستعمال «إخفاء» بدل الحذف.`
    );
    if (!confirmed) return;

    const { error: dbError } = await supabase
      .from("activities")
      .delete()
      .eq("id", activity.id);

    if (dbError) {
      setError("تعذّر حذف النشاط.");
      return;
    }
    await loadActivities();
  }

  if (loading) {
    return (
      <p className="py-12 text-center text-muted">جاري تحميل النشاطات...</p>
    );
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
          + إضافة نشاط
        </button>
        <button
          type="button"
          onClick={loadActivities}
          className="ms-auto border border-ink px-4 py-2 text-sm font-semibold btn-outline"
        >
          تحديث ⟳
        </button>
      </div>

      <p className="mt-4 text-sm text-muted">
        النشاطات الظاهرة تُعرض في الصفحة الرئيسية، وفي قائمة «نوع المساعدة» في
        نموذج طلب المساعدة.
      </p>

      {error && (
        <p className="mt-6 border border-ink px-4 py-3 font-semibold">⚠ {error}</p>
      )}

      <div className="mt-6 space-y-4">
        {editingId === "new" && (
          <ActivityForm
            supabase={supabase}
            initial={{
              title: "",
              description: "",
              details: "",
              image: null,
              enabled: true,
              sort_order: activities.length + 1,
            }}
            saving={saving}
            onSave={handleSave}
            onCancel={() => setEditingId(null)}
          />
        )}

        {activities.length === 0 && editingId !== "new" && (
          <p className="border border-line py-12 text-center text-muted">
            لا توجد نشاطات بعد. اضغط «إضافة نشاط» للبدء.
          </p>
        )}

        {activities.map((a) => {
          if (editingId === a.id) {
            return (
              <ActivityForm
                key={a.id}
                supabase={supabase}
                initial={a}
                saving={saving}
                onSave={handleSave}
                onCancel={() => setEditingId(null)}
              />
            );
          }

          return (
            <article
              key={a.id}
              className={`border border-ink p-5 ${a.enabled ? "" : "opacity-60"}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-heading text-xl font-bold">{a.title}</h3>
                  <p className="text-sm text-muted">
                    {a.enabled ? "ظاهر" : "مخفي"} · الترتيب {a.sort_order}
                    {a.image && " · فيه صورة"}
                    {a.details && " · فيه تفاصيل"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {a.enabled && (
                    <a
                      href={`/activities/${a.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="border border-ink px-4 py-2 text-sm font-semibold btn-outline"
                    >
                      عرض الصفحة ↗
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => setEditingId(a.id)}
                    disabled={editingId !== null}
                    className="border border-ink px-4 py-2 text-sm font-semibold btn-outline disabled:opacity-60"
                  >
                    تعديل
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleEnabled(a)}
                    disabled={editingId !== null}
                    className="border border-ink px-4 py-2 text-sm font-semibold btn-outline disabled:opacity-60"
                  >
                    {a.enabled ? "إخفاء" : "إظهار"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(a)}
                    disabled={editingId !== null}
                    className="border border-ink px-4 py-2 text-sm font-semibold btn-outline disabled:opacity-60"
                  >
                    حذف
                  </button>
                </div>
              </div>

              {a.description && (
                <p className="mt-4 border-t border-line pt-4 leading-relaxed text-muted">
                  {a.description}
                </p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}