"use client";

import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import BeneficiaryForm, {
  type Beneficiary,
  type BeneficiaryInput,
} from "@/components/admin/BeneficiaryForm";

type AidRecord = {
  id: string;
  aid_date: string;
  aid_type: string;
  campaign_id: string | null;
  description: string | null;
  amount: number | null;
  campaigns: { title: string } | null;
};

type AidInput = {
  aid_date: string;
  aid_type: string;
  campaign_id: string | null;
  description: string | null;
  amount: number | null;
};

type Option = { value: string; label: string };

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

function formatDZD(amount: number) {
  return new Intl.NumberFormat("fr-FR").format(amount) + " دج";
}

export default function BeneficiaryFile({
  supabase,
  beneficiary,
  onBack,
  onUpdated,
}: {
  supabase: SupabaseClient;
  beneficiary: Beneficiary;
  onBack: () => void;
  onUpdated: (b: Beneficiary) => void;
}) {
  const [records, setRecords] = useState<AidRecord[]>([]);
  const [aidTypes, setAidTypes] = useState<Option[]>([]);
  const [campaigns, setCampaigns] = useState<Option[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [addingAid, setAddingAid] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingAid, setPendingAid] = useState<AidInput | null>(null);
  const [duplicateDate, setDuplicateDate] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadFile = useCallback(async () => {
    const [recordsRes, activitiesRes, campaignsRes] = await Promise.all([
      supabase
        .from("aid_records")
        .select(
          "id, aid_date, aid_type, campaign_id, description, amount, campaigns(title)"
        )
        .eq("beneficiary_id", beneficiary.id)
        .order("aid_date", { ascending: false }),
      supabase
        .from("activities")
        .select("slug, title")
        .order("sort_order", { ascending: true }),
      supabase
        .from("campaigns")
        .select("id, title")
        .order("sort_order", { ascending: true }),
    ]);

    if (recordsRes.error) {
      setError("تعذّر تحميل سجل المساعدات.");
    } else {
      setRecords((recordsRes.data ?? []) as unknown as AidRecord[]);
    }

    setAidTypes([
      ...(activitiesRes.data ?? []).map((a) => ({
        value: a.slug as string,
        label: a.title as string,
      })),
      { value: "other", label: "أخرى" },
    ]);

    setCampaigns(
      (campaignsRes.data ?? []).map((c) => ({
        value: c.id as string,
        label: c.title as string,
      }))
    );

    setLoading(false);
  }, [supabase, beneficiary.id]);

  useEffect(() => {
    loadFile();
  }, [loadFile]);

  const aidLabel = (slug: string) =>
    aidTypes.find((t) => t.value === slug)?.label ?? slug;

  async function handleEdit(values: BeneficiaryInput) {
    setSaving(true);
    setError("");
    setMessage("");

    const { data, error: dbError } = await supabase
      .from("beneficiaries")
      .update(values)
      .eq("id", beneficiary.id)
      .select()
      .single();

    setSaving(false);

    if (dbError) {
      setError(
        dbError.code === "23505"
          ? "رقم التعريف الوطني مسجّل لعائلة أخرى."
          : "تعذّر حفظ التعديلات."
      );
      return;
    }

    onUpdated(data as Beneficiary);
    setEditing(false);
    setMessage("تم حفظ التعديلات ✓");
  }

  async function insertAid(values: AidInput) {
    setSaving(true);
    setError("");

    const { error: dbError } = await supabase
      .from("aid_records")
      .insert({ ...values, beneficiary_id: beneficiary.id });

    setSaving(false);

    if (dbError) {
      setError("تعذّر تسجيل المساعدة.");
      return;
    }

    setPendingAid(null);
    setDuplicateDate("");
    setAddingAid(false);
    setMessage("تم تسجيل المساعدة ✓");
    await loadFile();
  }

  function handleAidSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setMessage("");

    const d = new FormData(e.currentTarget);
    const get = (key: string) => String(d.get(key) ?? "").trim();
    const amountRaw = get("amount");

    const values: AidInput = {
      aid_date: get("aid_date") || today(),
      aid_type: get("aid_type"),
      campaign_id: get("campaign_id") || null,
      description: get("description") || null,
      amount: amountRaw ? Number(amountRaw) : null,
    };

    if (!values.aid_type) {
      setError("اختر نوع المساعدة.");
      return;
    }
    if (values.amount !== null && (isNaN(values.amount) || values.amount < 0)) {
      setError("المبلغ غير صحيح.");
      return;
    }

    // تنبيه: نفس الحملة مسجّلة من قبل لهذه العائلة
    if (values.campaign_id) {
      const previous = records.find((r) => r.campaign_id === values.campaign_id);
      if (previous) {
        setPendingAid(values);
        setDuplicateDate(previous.aid_date);
        return;
      }
    }

    insertAid(values);
  }

  const b = beneficiary;
  const address = [b.street, b.commune, b.daira, b.wilaya]
    .filter(Boolean)
    .join("، ");
  const totalAmount = records.reduce((sum, r) => sum + (r.amount ?? 0), 0);

  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="border border-ink px-4 py-2 text-sm font-semibold btn-outline"
      >
        العودة للقائمة
      </button>

      {message && (
        <p className="mt-6 border border-ink bg-action px-4 py-3 font-semibold">
          {message}
        </p>
      )}
      {error && (
        <p className="mt-6 border border-ink px-4 py-3 font-semibold">⚠ {error}</p>
      )}

      {/* بيانات العائلة */}
      <div className="mt-6">
        {editing ? (
          <BeneficiaryForm
            initial={b}
            saving={saving}
            submitLabel="حفظ التعديلات"
            onSave={handleEdit}
            onCancel={() => setEditing(false)}
          />
        ) : (
          <article className="border-2 border-ink p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-heading text-3xl font-bold">{b.head_name}</h2>
                <p className="mt-1 text-sm text-muted">
                  {b.status === "active" ? "عائلة نشطة" : "عائلة متوقفة"}
                  {b.situation && ` · ${b.situation}`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="shrink-0 border border-ink px-4 py-2 text-sm font-semibold btn-outline"
              >
                تعديل البيانات
              </button>
            </div>

            <dl className="mt-5 grid gap-x-6 gap-y-2 border-t border-line pt-5 sm:grid-cols-2">
              <div>
                <dt className="inline text-muted">الهاتف: </dt>
                <dd className="inline">
                  <a href={`tel:${b.phone}`} dir="ltr" className="underline">
                    {b.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="inline text-muted">أفراد العائلة: </dt>
                <dd className="inline">{b.family_size ?? "—"}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="inline text-muted">العنوان: </dt>
                <dd className="inline">{address}</dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="inline text-muted">رقم التعريف: </dt>
                <dd className="inline" dir="ltr">
                  {b.national_id ?? "—"}
                </dd>
              </div>
              <div className="sm:col-span-2">
                <dt className="inline text-muted">تاريخ التسجيل: </dt>
                <dd className="inline">{formatDate(b.created_at)}</dd>
              </div>
            </dl>

            {b.notes && (
              <p className="mt-5 border-t border-line pt-5 leading-relaxed text-muted">
                {b.notes}
              </p>
            )}
          </article>
        )}
      </div>

      {/* سجل المساعدات */}
      <div className="mt-10 flex flex-col gap-3 border-b border-ink pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="font-heading text-2xl font-bold">سجل المساعدات</h3>
          <p className="mt-1 text-sm text-muted">
            {records.length} مساعدة
            {totalAmount > 0 && (
              <>
                {" "}· المجموع <span dir="ltr">{formatDZD(totalAmount)}</span>
              </>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setAddingAid(true);
            setMessage("");
          }}
          disabled={addingAid}
          className="bg-action px-5 py-2 font-semibold transition-colors hover:bg-action-hover disabled:opacity-60"
        >
          + تسجيل مساعدة
        </button>
      </div>

      {/* تنبيه تكرار الحملة */}
      {pendingAid && (
        <div className="mt-6 border-2 border-ink p-5">
          <p className="font-semibold">
            ⚠ هذه العائلة استلمت مساعدة من نفس الحملة بتاريخ{" "}
            {formatDate(duplicateDate)}.
          </p>
          <p className="mt-2 text-sm text-muted">
            إذا كانت الحملة تُعطي أكثر من مرة (مثل الكفالة الشهرية) يمكنك
            المتابعة.
          </p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => insertAid(pendingAid)}
              disabled={saving}
              className="border border-ink px-5 py-2 font-semibold btn-outline disabled:opacity-60"
            >
              سجّلها رغم ذلك
            </button>
            <button
              type="button"
              onClick={() => {
                setPendingAid(null);
                setDuplicateDate("");
              }}
              className="bg-action px-5 py-2 font-semibold transition-colors hover:bg-action-hover"
            >
              تراجع
            </button>
          </div>
        </div>
      )}

      {/* نموذج تسجيل مساعدة */}
      {addingAid && (
        <form
          onSubmit={handleAidSubmit}
          className="mt-6 space-y-5 border-2 border-ink p-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="aid_type" className={labelClass}>
                نوع المساعدة *
              </label>
              <select
                id="aid_type"
                name="aid_type"
                defaultValue=""
                className={inputClass}
              >
                <option value="">اختر</option>
                {aidTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="aid_date" className={labelClass}>
                التاريخ *
              </label>
              <input
                id="aid_date"
                name="aid_date"
                type="date"
                defaultValue={today()}
                className={inputClass}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="campaign_id" className={labelClass}>
                ضمن حملة
              </label>
              <select
                id="campaign_id"
                name="campaign_id"
                defaultValue=""
                className={inputClass}
              >
                <option value="">بدون حملة</option>
                {campaigns.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="amount" className={labelClass}>
                القيمة (دج)
              </label>
              <input
                id="amount"
                name="amount"
                type="number"
                min={0}
                dir="ltr"
                placeholder="اختياري"
                className={`${inputClass} text-right`}
              />
            </div>
          </div>

          <div>
            <label htmlFor="description" className={labelClass}>
              التفاصيل
            </label>
            <input
              id="description"
              name="description"
              maxLength={500}
              placeholder="مثال: قفة مواد غذائية، دواء للضغط، محفظة وأدوات..."
              className={inputClass}
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-action px-6 py-3 font-semibold transition-colors hover:bg-action-hover disabled:opacity-60"
            >
              {saving ? "جاري التسجيل..." : "تسجيل"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAddingAid(false);
                setPendingAid(null);
                setError("");
              }}
              className="border border-ink px-6 py-3 font-semibold btn-outline"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* قائمة المساعدات */}
      <div className="mt-6">
        {loading && (
          <p className="py-8 text-center text-muted">جاري تحميل السجل...</p>
        )}

        {!loading && records.length === 0 && (
          <p className="border border-line py-10 text-center text-muted">
            لم تُسجَّل أي مساعدة لهذه العائلة بعد.
          </p>
        )}

        {records.map((r) => (
          <div
            key={r.id}
            className="flex flex-col gap-1 border-b border-line py-4 sm:flex-row sm:items-start sm:justify-between"
          >
            <div>
              <p className="font-semibold">
                {aidLabel(r.aid_type)}
                {r.campaigns?.title && (
                  <span className="font-normal text-muted">
                    {" "}· {r.campaigns.title}
                  </span>
                )}
              </p>
              {r.description && (
                <p className="mt-1 text-sm text-muted">{r.description}</p>
              )}
            </div>
            <div className="shrink-0 text-sm sm:text-left">
              <p className="text-muted">{formatDate(r.aid_date)}</p>
              {r.amount !== null && (
                <p className="font-semibold" dir="ltr">
                  {formatDZD(r.amount)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}