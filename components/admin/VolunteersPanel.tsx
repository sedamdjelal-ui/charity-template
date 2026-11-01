"use client";

import { useCallback, useEffect, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

type Volunteer = {
  id: string;
  created_at: string;
  full_name: string;
  phone: string;
  wilaya: string;
  daira: string;
  commune: string;
  skills: string | null;
  availability: string | null;
  status: string;
};

const statuses = [
  { value: "new", label: "جديد" },
  { value: "contacted", label: "تم التواصل" },
  { value: "active", label: "نشط" },
  { value: "inactive", label: "غير نشط" },
];

export default function VolunteersPanel({
  supabase,
}: {
  supabase: SupabaseClient;
}) {
  const [loading, setLoading] = useState(true);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [filter, setFilter] = useState("all");
  const [error, setError] = useState("");

  const loadVolunteers = useCallback(async () => {
    const { data, error: dbError } = await supabase
      .from("volunteers")
      .select("*")
      .order("created_at", { ascending: false });

    if (dbError) {
      setError("تعذّر تحميل المتطوعين.");
    } else {
      setError("");
      setVolunteers((data ?? []) as Volunteer[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    loadVolunteers();
  }, [loadVolunteers]);

  async function updateStatus(id: string, status: string) {
    const previous = volunteers;
    setVolunteers((vs) => vs.map((v) => (v.id === id ? { ...v, status } : v)));

    const { error: dbError } = await supabase
      .from("volunteers")
      .update({ status })
      .eq("id", id);

    if (dbError) {
      setVolunteers(previous);
      setError("تعذّر تحديث الحالة. حاول مرة أخرى.");
    }
  }

  if (loading) {
    return (
      <p className="py-12 text-center text-muted">جاري تحميل المتطوعين...</p>
    );
  }

  const visible =
    filter === "all"
      ? volunteers
      : volunteers.filter((v) => v.status === filter);

  const countOf = (status: string) =>
    volunteers.filter((v) => v.status === status).length;

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
          الكل ({volunteers.length})
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
          onClick={loadVolunteers}
          className="ms-auto border border-ink px-4 py-2 text-sm font-semibold transition-colors hover:bg-ink hover:text-white"
        >
          تحديث ⟳
        </button>
      </div>

      {error && (
        <p className="mt-6 border border-ink px-4 py-3 font-semibold">⚠ {error}</p>
      )}

      {/* قائمة المتطوعين */}
      <div className="mt-6 space-y-4">
        {visible.length === 0 && (
          <p className="border border-line py-12 text-center text-muted">
            لا يوجد متطوعون في هذا القسم.
          </p>
        )}

        {visible.map((v) => {
          const address = [v.commune, v.daira, v.wilaya]
            .filter(Boolean)
            .join("، ");
          const skills = v.skills ? v.skills.split("، ") : [];

          return (
            <article key={v.id} className="border border-ink p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-heading text-xl font-bold">
                    {v.full_name}
                  </h3>
                  <p className="text-sm text-muted">
                    {new Date(v.created_at).toLocaleDateString("ar-DZ", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <select
                  value={v.status}
                  onChange={(e) => updateStatus(v.id, e.target.value)}
                  className={`border border-ink px-3 py-2 font-semibold ${
                    v.status === "new" ? "bg-action" : "bg-white"
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
                    <a href={`tel:${v.phone}`} dir="ltr" className="underline">
                      {v.phone}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="inline text-muted">التوفر: </dt>
                  <dd className="inline">{v.availability ?? "—"}</dd>
                </div>
                <div className="sm:col-span-2">
                  <dt className="inline text-muted">العنوان: </dt>
                  <dd className="inline">{address}</dd>
                </div>
              </dl>

              {skills.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
                  {skills.map((skill) => (
                    <span
                      key={skill}
                      className="border border-line px-3 py-1 text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}