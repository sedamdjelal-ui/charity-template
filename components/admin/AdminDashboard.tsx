"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import HelpRequestsPanel from "@/components/admin/HelpRequestsPanel";
import VolunteersPanel from "@/components/admin/VolunteersPanel";
import CampaignsPanel from "@/components/admin/CampaignsPanel";
import NewsPanel from "@/components/admin/NewsPanel";

const tabs = [
  { id: "help", label: "طلبات المساعدة" },
  { id: "volunteers", label: "المتطوعون" },
  { id: "campaigns", label: "الحملات" },
  { id: "news", label: "الأخبار" },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [tab, setTab] = useState("help");

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
      setReady(true);
    }
    init();
  }, [supabase, router]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/admin/login");
  }

  if (!ready) {
    return <p className="py-20 text-center text-muted">جاري التحميل...</p>;
  }

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
        <button
          type="button"
          onClick={handleLogout}
          className="border border-ink px-4 py-2 font-semibold transition-colors hover:bg-ink hover:text-white"
        >
          خروج
        </button>
      </div>

      {/* التبويبات */}
      <div className="mt-8 flex overflow-x-auto border-b border-line">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`-mb-px shrink-0 px-5 py-3 font-heading text-xl ${
              tab === t.id
                ? "border-b-2 border-ink font-bold"
                : "text-muted hover:text-ink"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6">
        {tab === "help" && <HelpRequestsPanel supabase={supabase} />}
        {tab === "volunteers" && <VolunteersPanel supabase={supabase} />}
        {tab === "campaigns" && <CampaignsPanel supabase={supabase} />}
        {tab === "news" && <NewsPanel supabase={supabase} />}
      </div>
    </div>
  );
}