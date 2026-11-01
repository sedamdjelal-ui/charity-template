"use client";

import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

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

const statuses = [
  { value: "new", label: "جديد" },
  { value: "reviewing", label: "قيد الدراسة" },
  { value: "accepted", label: "مقبول" },
  { value: "served", label: "تمّت المساعدة" },
  { value: "rejected", label: "مرفوض" },
];

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
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  const loadRequests = useCallback(async () => {
    const [requestsRes, activitiesRes] = await Promise.all([
      supabase
        .from("help_requests")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase.from("activities").select("slug, title"),
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
          className="ms-auto border border-ink px-4 py-2 text-sm font-semibold transition-colors hover:bg-ink hover:text-white"
        >
          تحديث ⟳
        </button>
      </div>

      {error && (
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
            </article>
          );
        })}
      </div>
    </div>
  );
}