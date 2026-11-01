"use client";

import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import BeneficiaryForm, {
  emptyBeneficiary,
  type Beneficiary,
  type BeneficiaryInput,
} from "@/components/admin/BeneficiaryForm";
import BeneficiaryFile from "@/components/admin/BeneficiaryFile";

type Duplicate = { id: string; head_name: string; phone: string };

export default function BeneficiariesPanel({
  supabase,
}: {
  supabase: SupabaseClient;
}) {
  const [loading, setLoading] = useState(true);
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("active");
  const [pending, setPending] = useState<BeneficiaryInput | null>(null);
  const [duplicates, setDuplicates] = useState<Duplicate[]>([]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadBeneficiaries = useCallback(async () => {
    const { data, error: dbError } = await supabase
      .from("beneficiaries")
      .select("*")
      .order("created_at", { ascending: false });

    if (dbError) {
      setError("تعذّر تحميل المستفيدين.");
    } else {
      setError("");
      setBeneficiaries((data ?? []) as Beneficiary[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadBeneficiaries();
  }, [loadBeneficiaries]);

  async function insertBeneficiary(values: BeneficiaryInput) {
    setSaving(true);
    const { error: dbError } = await supabase
      .from("beneficiaries")
      .insert(values);
    setSaving(false);

    if (dbError) {
      setError(
        dbError.code === "23505"
          ? "رقم التعريف الوطني مسجّل مسبقاً لعائلة أخرى."
          : "تعذّر الحفظ. تأكد من رقم الهاتف ورقم التعريف الوطني."
      );
      return;
    }

    setPending(null);
    setDuplicates([]);
    setAdding(false);
    setMessage(`تمت إضافة عائلة «${values.head_name}» ✓`);
    await loadBeneficiaries();
  }

  async function handleAdd(values: BeneficiaryInput) {
    setError("");
    setMessage("");
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
      .select("id, head_name, phone")
      .eq("phone", values.phone);

    if (samePhone && samePhone.length > 0) {
      setPending(values);
      setDuplicates(samePhone as Duplicate[]);
      return;
    }

    await insertBeneficiary(values);
  }

  async function toggleStatus(b: Beneficiary) {
    const status = b.status === "active" ? "inactive" : "active";
    const { error: dbError } = await supabase
      .from("beneficiaries")
      .update({ status })
      .eq("id", b.id);

    if (dbError) {
      setError("تعذّر تغيير الحالة.");
      return;
    }
    await loadBeneficiaries();
  }

  if (loading) {
    return (
      <p className="py-12 text-center text-muted">جاري تحميل المستفيدين...</p>
    );
  }

  // عرض ملف عائلة
  const opened = beneficiaries.find((b) => b.id === openId);
  if (opened) {
    return (
      <BeneficiaryFile
        supabase={supabase}
        beneficiary={opened}
        onBack={() => setOpenId(null)}
        onUpdated={(updated) =>
          setBeneficiaries((bs) =>
            bs.map((b) => (b.id === updated.id ? updated : b))
          )
        }
      />
    );
  }

  const term = search.trim();
  const visible = beneficiaries.filter((b) => {
    if (statusFilter !== "all" && b.status !== statusFilter) return false;
    if (!term) return true;
    return [b.head_name, b.phone, b.national_id ?? "", b.commune]
      .join(" ")
      .includes(term);
  });

  const activeCount = beneficiaries.filter((b) => b.status === "active").length;

  return (
    <div>
      {/* الأزرار العلوية */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setAdding(true);
            setMessage("");
          }}
          disabled={adding}
          className="bg-action px-5 py-2 font-semibold transition-colors hover:bg-action-hover disabled:opacity-60"
        >
          + إضافة عائلة
        </button>
        <button
          type="button"
          onClick={loadBeneficiaries}
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
      {error && (
        <p className="mt-6 border border-ink px-4 py-3 font-semibold">⚠ {error}</p>
      )}

      {/* تنبيه تكرار الهاتف */}
      {pending && duplicates.length > 0 && (
        <div className="mt-6 border-2 border-ink p-5">
          <p className="font-semibold">
            ⚠ رقم الهاتف {pending.phone} مسجّل مسبقاً لـ:
          </p>
          <ul className="mt-2 list-inside list-disc text-muted">
            {duplicates.map((d) => (
              <li key={d.id}>{d.head_name}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-muted">
            قد تكون نفس العائلة. تأكد قبل الإضافة.
          </p>
          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={() => insertBeneficiary(pending)}
              disabled={saving}
              className="border border-ink px-5 py-2 font-semibold btn-outline disabled:opacity-60"
            >
              عائلة مختلفة، أضفها
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

      {adding && (
        <div className="mt-6">
          <BeneficiaryForm
            initial={emptyBeneficiary}
            saving={saving}
            submitLabel="إضافة العائلة"
            onSave={handleAdd}
            onCancel={() => {
              setAdding(false);
              setPending(null);
              setDuplicates([]);
              setError("");
            }}
          />
        </div>
      )}

      {/* البحث والتصفية */}
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث بالاسم، الهاتف، رقم التعريف أو البلدية"
          className="w-full border border-ink bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-action"
        />
        <div className="flex shrink-0 gap-2">
          {[
            { value: "active", label: `نشطة (${activeCount})` },
            {
              value: "inactive",
              label: `متوقفة (${beneficiaries.length - activeCount})`,
            },
            { value: "all", label: "الكل" },
          ].map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatusFilter(f.value)}
              className={`border border-ink px-4 py-2 text-sm font-semibold ${
                statusFilter === f.value ? "bg-ink text-white" : "bg-white"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* القائمة */}
      <div className="mt-6 space-y-4">
        {visible.length === 0 && (
          <p className="border border-line py-12 text-center text-muted">
            {beneficiaries.length === 0
              ? "لا توجد عائلات مسجّلة بعد. اضغط «إضافة عائلة» للبدء."
              : "لا توجد نتائج."}
          </p>
        )}

        {visible.map((b) => {
          const address = [b.street, b.commune, b.daira, b.wilaya]
            .filter(Boolean)
            .join("، ");

          return (
            <article
              key={b.id}
              className={`border border-ink p-5 ${
                b.status === "active" ? "" : "opacity-60"
              }`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-heading text-xl font-bold">
                    {b.head_name}
                  </h3>
                  <p className="text-sm text-muted">
                    {b.status === "active" ? "نشطة" : "متوقفة"}
                    {b.situation && ` · ${b.situation}`}
                  </p>
                </div>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setOpenId(b.id);
                      setMessage("");
                    }}
                    className="bg-action px-4 py-2 text-sm font-semibold transition-colors hover:bg-action-hover"
                  >
                    فتح الملف
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleStatus(b)}
                    className="border border-ink px-4 py-2 text-sm font-semibold btn-outline"
                  >
                    {b.status === "active" ? "إيقاف" : "تفعيل"}
                  </button>
                </div>
              </div>

              <dl className="mt-4 grid gap-x-6 gap-y-2 border-t border-line pt-4 text-sm sm:grid-cols-2">
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
                {b.national_id && (
                  <div className="sm:col-span-2">
                    <dt className="inline text-muted">رقم التعريف: </dt>
                    <dd className="inline" dir="ltr">
                      {b.national_id}
                    </dd>
                  </div>
                )}
              </dl>
            </article>
          );
        })}
      </div>
    </div>
  );
}