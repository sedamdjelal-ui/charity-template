"use client";

import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import BeneficiaryForm, {
  type BeneficiaryInput,
} from "@/components/admin/BeneficiaryForm";

type HelpRequest = {
  id: string;
  created_at: string;
  full_name: string;
  phone: string;
  wilaya: string;
  daira: string;
  commune: string;
  street: string | null;
  family_size: number | null;
  need_type: string;
  description: string | null;
  status: string;
};

type Duplicate = { id: string; head_name: string };

const statuses = [
  { value: "new", label: "جديد" },
  { value: "reviewing", label: "قيد الدراسة" },
  { value: "accepted", label: "مقبول" },
  { value: "served", label: "تمّت المساعدة" },
  { value: "rejected", label: "مرفوض" },
];

const convertibleStatuses = ["accepted", "served"];

export default function HelpRequestsPanel({
  supabase,
}: {
  supabase: SupabaseClient;
}) {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [needLabels, setNeedLabels] = useState<Record<string, string>>({
    other: "أخرى",
  });
  const [convertedIds, setConvertedIds] = useState<string[]>([]);
  const [convertingId, setConvertingId] = useState<string | null>(null);
  const [pending, setPending] = useState<BeneficiaryInput | null>(null);
  const [duplicates, setDuplicates] = useState<Duplicate[]>([]);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadRequests = useCallback(async () => {
    const [requestsRes, activitiesRes, convertedRes] = await Promise.all([
      supabase
        .from("help_requests")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("activities").select("slug, title"),
      supabase
        .from("beneficiaries")
        .select("help_request_id")
        .not("help_request_id", "is", null),
    ]);

    if (requestsRes.error) {
      setError("تعذّر تحميل الطلبات.");
    } else {
      setError("");
      setRequests((requestsRes.data ?? []) as HelpRequest[]);
    }

    if (!activitiesRes.error) {
      setNeedLabels({
        ...Object.fromEntries(
          (activitiesRes.data ?? []).map((a) => [a.slug, a.title])
        ),
        other: "أخرى",
      });
    }

    if (!convertedRes.error) {
      setConvertedIds(
        (convertedRes.data ?? []).map((b) => b.help_request_id as string)
      );
    }

    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  async function updateStatus(id: string, status: string) {
    const previous = requests;
    setRequests((rs) => rs.map((r) => (r.id === id ? { ...r, status } : r)));

    const { error: dbError } = await supabase
      .from("help_requests")
      .update({ status })
      .eq("id", id);

    if (dbError) {
      setRequests(previous);
      setError("تعذّر تحديث الحالة. حاول مرة أخرى.");
    }
  }

  function startConvert(id: string) {
    setConvertingId(id);
    setPending(null);
    setDuplicates([]);
    setError("");
    setMessage("");
  }

  function cancelConvert() {
    setConvertingId(null);
    setPending(null);
    setDuplicates([]);
    setError("");
  }

  async function insertBeneficiary(values: BeneficiaryInput) {
    if (!convertingId) return;

    setSaving(true);
    const { error: dbError } = await supabase
      .from("beneficiaries")
      .insert({ ...values, help_request_id: convertingId });
    setSaving(false);

    if (dbError) {
      setError(
        dbError.code === "23505"
          ? "هذا الطلب أو رقم التعريف الوطني مسجّل مسبقاً في المستفيدين."
          : "تعذّر الحفظ. تأكد من البيانات."
      );
      return;
    }

    setConvertedIds((ids) => [...ids, convertingId]);
    setConvertingId(null);
    setPending(null);
    setDuplicates([]);
    setMessage(
      `تم تسجيل «${values.head_name}» في المستفيدين ✓ يمكنك فتح ملفه من تبويب «المستفيدون».`
    );
  }

  async function handleConvert(values: BeneficiaryInput) {
    setError("");
    setPending(null);
    setDuplicates([]);

    // 1. رقم التعريف الوطني: منع نهائي
    if (values.national_id) {
      const { data } = await supabase
        .from("beneficiaries")
        .select("head_name")
        .eq("national_id", values.national_id)
        .maybeSingle();

      if (data) {
        setError(`رقم التعريف الوطني مسجّل مسبقاً باسم: ${data.head_name}`);
        return;
      }
    }

    // 2. رقم الهاتف: تنبيه فقط
    const { data: samePhone } = await supabase
      .from("beneficiaries")
      .select("id, head_name")
      .eq("phone", values.phone);

    if (samePhone && samePhone.length > 0) {
      setPending(values);
      setDuplicates(samePhone as Duplicate[]);
      return;
    }

    await insertBeneficiary(values);
  }

  if (loading) {
    return <p className="py-12 text-center text-muted">جاري تحميل الطلبات...</p>;
  }

  const visible =
    filter === "all" ? requests : requests.filter((r) => r.status === filter);

  const countOf = (status: string) =>
    requests.filter((r) => r.status === status).length;

  return (
    <div>
      {/* التصفية والتحديث */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter("all")}
          className={`border border-ink px-4 py-2 text-sm font-semibold ${
            filter === "all" ? "bg-ink text-white" : "bg-white"
          }`}
        >
          الكل ({requests.length})
        </button>
        {statuses.map((s) => (
          <button
            key={s.value}
            type="button"
            onClick={() => setFilter(s.value)}
            className={`border border-ink px-4 py-2 text-sm font-semibold ${
              filter === s.value ? "bg-ink text-white" : "bg-white"
            }`}
          >
            {s.label} ({countOf(s.value)})
          </button>
        ))}
        <button
          type="button"
          onClick={loadRequests}
          className="ms-auto border border-ink px-4 py-2 text-sm font-semibold btn-outline"
        >
          تحديث ⟳
        </button>
      </div>

      {message && (
        <p className="mt-6 border border-ink bg-action px-4 py-3 font-semibold">
          {message}
        </p>
      )}
      {error && !convertingId && (
        <p className="mt-6 border border-ink px-4 py-3 font-semibold">⚠ {error}</p>
      )}

      {/* قائمة الطلبات */}
      <div className="mt-6 space-y-4">
        {visible.length === 0 && (
          <p className="border border-line py-12 text-center text-muted">
            لا توجد طلبات في هذا القسم.
          </p>
        )}

        {visible.map((r) => {
          const address = [r.street, r.commune, r.daira, r.wilaya]
            .filter(Boolean)
            .join("، ");
          const isConverted = convertedIds.includes(r.id);
          const canConvert =
            convertibleStatuses.includes(r.status) && !isConverted;

          return (
            <article key={r.id} className="border border-ink p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-heading text-xl font-bold">
                    {r.full_name}
                  </h3>
                  <p className="text-sm text-muted">
                    {new Date(r.created_at).toLocaleDateString("ar-DZ", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                    {isConverted && " · مسجّل في المستفيدين ✓"}
                  </p>
                </div>

                <select
                  value={r.status}
                  onChange={(e) => updateStatus(r.id, e.target.value)}
                  className={`border border-ink px-3 py-2 font-semibold ${
                    r.status === "new" ? "bg-action" : "bg-white"
                  }`}
                >
                  {statuses.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <dl className="mt-4 grid gap-x-6 gap-y-2 border-t border-line pt-4 text-sm sm:grid-cols-2">
                <div>
                  <dt className="inline text-muted">الهاتف: </dt>
                  <dd className="inline">
                    <a href={`tel:${r.phone}`} dir="ltr" className="underline">
                      {r.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="inline text-muted">نوع المساعدة: </dt>
                  <dd className="inline">
                    {needLabels[r.need_type] ?? r.need_type}
                  </dd>
                </div>
                <div>
                  <dt className="inline text-muted">العنوان: </dt>
                  <dd className="inline">{address}</dd>
                </div>
                <div>
                  <dt className="inline text-muted">أفراد العائلة: </dt>
                  <dd className="inline">{r.family_size ?? "—"}</dd>
                </div>
              </dl>

              {r.description && (
                <p className="mt-4 border-t border-line pt-4 leading-relaxed text-muted">
                  {r.description}
                </p>
              )}

              {/* زر التحويل */}
              {canConvert && convertingId !== r.id && (
                <div className="mt-4 border-t border-line pt-4">
                  <button
                    type="button"
                    onClick={() => startConvert(r.id)}
                    disabled={convertingId !== null}
                    className="bg-action px-5 py-2 font-semibold transition-colors hover:bg-action-hover disabled:opacity-60"
                  >
                    تحويل إلى مستفيد
                  </button>
                </div>
              )}

              {/* نموذج التحويل */}
              {convertingId === r.id && (
                <div className="mt-4 border-t border-line pt-4">
                  <p className="mb-4 font-semibold">
                    راجع البيانات، وأضف رقم التعريف الوطني إن توفّر، ثم احفظ:
                  </p>

                  {error && (
                    <p className="mb-4 border border-ink px-4 py-3 font-semibold">
                      ⚠ {error}
                    </p>
                  )}

                  {pending && duplicates.length > 0 && (
                    <div className="mb-4 border-2 border-ink p-5">
                      <p className="font-semibold">
                        ⚠ رقم الهاتف {pending.phone} مسجّل مسبقاً لـ:
                      </p>
                      <ul className="mt-2 list-inside list-disc text-muted">
                        {duplicates.map((d) => (
                          <li key={d.id}>{d.head_name}</li>
                        ))}
                      </ul>
                      <div className="mt-4 flex gap-3">
                        <button
                          type="button"
                          onClick={() => insertBeneficiary(pending)}
                          disabled={saving}
                          className="border border-ink px-5 py-2 font-semibold btn-outline disabled:opacity-60"
                        >
                          عائلة مختلفة، سجّلها
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setPending(null);
                            setDuplicates([]);
                          }}
                          className="bg-action px-5 py-2 font-semibold transition-colors hover:bg-action-hover"
                        >
                          تراجع
                        </button>
                      </div>
                    </div>
                  )}

                  <BeneficiaryForm
                    initial={{
                      head_name: r.full_name,
                      national_id: null,
                      phone: r.phone,
                      wilaya: r.wilaya,
                      daira: r.daira,
                      commune: r.commune,
                      street: r.street,
                      family_size: r.family_size,
                      situation: needLabels[r.need_type] ?? null,
                      notes: r.description,
                    }}
                    saving={saving}
                    submitLabel="تسجيل كمستفيد"
                    onSave={handleConvert}
                    onCancel={cancelConvert}
                  />
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}