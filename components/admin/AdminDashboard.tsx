"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { siteConfig } from "@/config/site";

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

const needLabels: Record<string, string> = Object.fromEntries([
  ...siteConfig.activities.map((a) => [a.id, a.title]),
  ["other", "أخرى"],
]);

export default function AdminDashboard() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [loading, setLoading] = useState(true);
  const [email, setEmail] = useState("");
  const [requests, setRequests] = useState<HelpRequest[]>([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  const loadRequests = useCallback(async () => {
    const { data, error: dbError } = await supabase
      .from("help_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (dbError) {
      setError("تعذّر تحميل الطلبات.");
      return;
    }
    setError("");
    setRequests((data ?? []) as HelpRequest[]);
  }, [supabase]);

  useEffect(() => {
    async function init() {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/admin/login");
        return;
      }

      setEmail(user.email ?? "");
      await loadRequests();
      setLoading(false);
    }
    init();
  }, [supabase, router, loadRequests]);

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

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  if (loading) {
    return <p className="py-20 text-center text-muted">جاري التحميل...</p>;
  }

  const visible =
    filter === "all" ? requests : requests.filter((r) => r.status === filter);

  const countOf = (status: string) =>
    requests.filter((r) => r.status === status).length;

  return (
    <div>
      {/* الشريط العلوي */}
      <div className="flex flex-col gap-4 border-b border-ink pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-4xl font-bold">لوحة الإدارة</h1>
          <p className="mt-2 text-sm text-muted" dir="ltr">
            {email}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={loadRequests}
            className="border border-ink px-4 py-2 font-semibold transition-colors hover:bg-ink hover:text-white"
          >
            تحديث ⟳
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="border border-ink px-4 py-2 font-semibold transition-colors hover:bg-ink hover:text-white"
          >
            خروج
          </button>
        </div>
      </div>

      <h2 className="mt-10 font-heading text-2xl font-bold">طلبات المساعدة</h2>

      {/* التصفية حسب الحالة */}
      <div className="mt-4 flex flex-wrap gap-2">
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