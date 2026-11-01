"use client";

import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

type Campaign = {
  id: string;
  title: string;
  description: string | null;
  goal: number;
  raised: number;
  enabled: boolean;
  sort_order: number;
};

type CampaignInput = Omit<Campaign, "id">;

const inputClass =
  "w-full border border-ink bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-action";
const labelClass = "mb-2 block font-semibold";

const emptyCampaign: CampaignInput = {
  title: "",
  description: "",
  goal: 0,
  raised: 0,
  enabled: true,
  sort_order: 0,
};

function formatDZD(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(amount) + " دج";
}

function CampaignForm({
  initial,
  saving,
  onSave,
  onCancel,
}: {
  initial: CampaignInput;
  saving: boolean;
  onSave: (values: CampaignInput) => void;
  onCancel: () => void;
}) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    onSave({
      title: String(d.get("title") || "").trim(),
      description: String(d.get("description") || "").trim() || null,
      goal: Number(d.get("goal")),
      raised: Number(d.get("raised")),
      sort_order: Number(d.get("sort_order")) || 0,
      enabled: d.get("enabled") === "on",
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 border-2 border-ink p-5">
      <div>
        <label htmlFor="title" className={labelClass}>
          عنوان الحملة *
        </label>
        <input
          id="title"
          name="title"
          required
          minLength={3}
          maxLength={120}
          defaultValue={initial.title}
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          وصف قصير
        </label>
        <textarea
          id="description"
          name="description"
          rows={3}
          maxLength={500}
          defaultValue={initial.description ?? ""}
          className={inputClass}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="goal" className={labelClass}>
            الهدف (دج) *
          </label>
          <input
            id="goal"
            name="goal"
            type="number"
            required
            min={1}
            dir="ltr"
            defaultValue={initial.goal || ""}
            className={`${inputClass} text-right`}
          />
        </div>
        <div>
          <label htmlFor="raised" className={labelClass}>
            المبلغ المجموع (دج) *
          </label>
          <input
            id="raised"
            name="raised"
            type="number"
            required
            min={0}
            dir="ltr"
            defaultValue={initial.raised}
            className={`${inputClass} text-right`}
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

      <label className="flex items-center gap-3">
        <input
          type="checkbox"
          name="enabled"
          defaultChecked={initial.enabled}
          className="h-5 w-5 accent-ink"
        />
        <span>ظاهرة في الموقع</span>
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

export default function CampaignsPanel({
  supabase,
}: {
  supabase: SupabaseClient;
}) {
  const [loading, setLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const loadCampaigns = useCallback(async () => {
    const { data, error: dbError } = await supabase
      .from("campaigns")
      .select("*")
      .order("sort_order", { ascending: true });

    if (dbError) {
      setError("تعذّر تحميل الحملات.");
    } else {
      setError("");
      setCampaigns((data ?? []) as Campaign[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadCampaigns();
  }, [loadCampaigns]);

  async function handleSave(values: CampaignInput) {
    setSaving(true);
    setError("");

    const { error: dbError } =
      editingId === "new"
        ? await supabase.from("campaigns").insert(values)
        : await supabase.from("campaigns").update(values).eq("id", editingId);

    setSaving(false);

    if (dbError) {
      setError(
        "تعذّر الحفظ. تأكد أن العنوان 3 أحرف على الأقل وأن الهدف أكبر من صفر."
      );
      return;
    }

    setEditingId(null);
    await loadCampaigns();
  }

  async function toggleEnabled(campaign: Campaign) {
    const { error: dbError } = await supabase
      .from("campaigns")
      .update({ enabled: !campaign.enabled })
      .eq("id", campaign.id);

    if (dbError) {
      setError("تعذّر تغيير حالة الظهور.");
      return;
    }
    await loadCampaigns();
  }

  async function handleDelete(campaign: Campaign) {
    const confirmed = window.confirm(
      `هل تريد حذف حملة «${campaign.title}» نهائياً؟ إذا أردت فقط إخفاءها اضغط «إلغاء» واستعمل زر الإخفاء.`
    );
    if (!confirmed) return;

    const { error: dbError } = await supabase
      .from("campaigns")
      .delete()
      .eq("id", campaign.id);

    if (dbError) {
      setError("تعذّر حذف الحملة.");
      return;
    }
    await loadCampaigns();
  }

  if (loading) {
    return <p className="py-12 text-center text-muted">جاري تحميل الحملات...</p>;
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
          + إضافة حملة
        </button>
        <button
          type="button"
          onClick={loadCampaigns}
          className="ms-auto border border-ink px-4 py-2 text-sm font-semibold btn-outline"
        >
          تحديث ⟳
        </button>
      </div>

      {error && (
        <p className="mt-6 border border-ink px-4 py-3 font-semibold">⚠ {error}</p>
      )}

      <div className="mt-6 space-y-4">
        {editingId === "new" && (
          <CampaignForm
            initial={{ ...emptyCampaign, sort_order: campaigns.length + 1 }}
            saving={saving}
            onSave={handleSave}
            onCancel={() => setEditingId(null)}
          />
        )}

        {campaigns.length === 0 && editingId !== "new" && (
          <p className="border border-line py-12 text-center text-muted">
            لا توجد حملات بعد. اضغط «إضافة حملة» للبدء.
          </p>
        )}

        {campaigns.map((c) => {
          if (editingId === c.id) {
            return (
              <CampaignForm
                key={c.id}
                initial={c}
                saving={saving}
                onSave={handleSave}
                onCancel={() => setEditingId(null)}
              />
            );
          }

          const percent = Math.min(100, Math.round((c.raised / c.goal) * 100));

          return (
            <article
              key={c.id}
              className={`border border-ink p-5 ${c.enabled ? "" : "opacity-60"}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-heading text-xl font-bold">{c.title}</h3>
                  <p className="text-sm text-muted">
                    {c.enabled ? "ظاهرة في الموقع" : "مخفية"} · الترتيب{" "}
                    {c.sort_order}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingId(c.id)}
                    disabled={editingId !== null}
                    className="border border-ink px-4 py-2 text-sm font-semibold btn-outline disabled:opacity-60"
                  >
                    تعديل
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleEnabled(c)}
                    disabled={editingId !== null}
                    className="border border-ink px-4 py-2 text-sm font-semibold btn-outline disabled:opacity-60"
                  >
                    {c.enabled ? "إخفاء" : "إظهار"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c)}
                    disabled={editingId !== null}
                    className="border border-ink px-4 py-2 text-sm font-semibold btn-outline disabled:opacity-60"
                  >
                    حذف
                  </button>
                </div>
              </div>

              <div className="mt-4 border-t border-line pt-4">
                <div className="mb-2 flex justify-between text-sm">
                  <span className="font-semibold">{percent}%</span>
                  <span className="text-muted">
                    <span dir="ltr">{formatDZD(c.raised)}</span> من{" "}
                    <span dir="ltr">{formatDZD(c.goal)}</span>
                  </span>
                </div>
                <div className="h-3 w-full border border-ink bg-white">
                  <div
                    className="h-full bg-action"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}