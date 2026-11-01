"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import HelpRequestsPanel from "@/components/admin/HelpRequestsPanel";
import BeneficiariesPanel from "@/components/admin/BeneficiariesPanel";
import VolunteersPanel from "@/components/admin/VolunteersPanel";
import CampaignsPanel from "@/components/admin/CampaignsPanel";
import NewsPanel from "@/components/admin/NewsPanel";
import ActivitiesPanel from "@/components/admin/ActivitiesPanel";
import MembersPanel from "@/components/admin/MembersPanel";
import SettingsPanel from "@/components/admin/SettingsPanel";
import AccountPanel from "@/components/admin/AccountPanel";

type Me = {
  id: string;
  email: string;
  fullName: string;
  role: "president" | "member";
};

const tabs = [
  { id: "help", label: "طلبات المساعدة", presidentOnly: false },
  { id: "beneficiaries", label: "المستفيدون", presidentOnly: false },
  { id: "volunteers", label: "المتطوعون", presidentOnly: false },
  { id: "campaigns", label: "الحملات", presidentOnly: false },
  { id: "news", label: "الأخبار", presidentOnly: false },
  { id: "activities", label: "النشاطات", presidentOnly: false },
  { id: "members", label: "الأعضاء", presidentOnly: true },
  { id: "settings", label: "الإعدادات", presidentOnly: true },
  { id: "account", label: "حسابي", presidentOnly: false },
];

export default function AdminDashboard() {
  const router = useRouter();
  const [supabase] = useState(() => createClient());
  const [ready, setReady] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [me, setMe] = useState<Me | null>(null);
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

      const { data: member } = await supabase
        .from("members")
        .select("full_name, role, active")
        .eq("user_id", user.id)
        .maybeSingle();

      if (!member || !member.active) {
        setBlocked(true);
        setReady(true);
        return;
      }

      setMe({
        id: user.id,
        email: user.email ?? "",
        fullName: member.full_name,
        role: member.role,
      });
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

  if (blocked || !me) {
    return (
      <div className="mx-auto max-w-md border-2 border-ink p-8 text-center">
        <h1 className="font-heading text-3xl font-bold">الحساب غير مفعّل</h1>
        <p className="mt-4 leading-loose text-muted">
          هذا الحساب غير مسجّل كعضو في الجمعية، أو تم إيقافه. تواصل مع رئيس
          الجمعية.
        </p>
        <button
          type="button"
          onClick={handleLogout}
          className="mt-8 border border-ink px-6 py-3 font-semibold transition-colors hover:bg-ink hover:text-white"
        >
          خروج
        </button>
      </div>
    );
  }

  const isPresident = me.role === "president";
  const visibleTabs = tabs.filter((t) => !t.presidentOnly || isPresident);

  return (
    <div>
      {/* الشريط العلوي */}
      <div className="flex flex-col gap-4 border-b border-ink pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-4xl font-bold">لوحة الإدارة</h1>
          <p className="mt-2 text-sm text-muted">
            {me.fullName} · {isPresident ? "رئيس" : "عضو"}
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
        {visibleTabs.map((t) => (
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
        {tab === "beneficiaries" && <BeneficiariesPanel supabase={supabase} />}
        {tab === "volunteers" && <VolunteersPanel supabase={supabase} />}
        {tab === "campaigns" && <CampaignsPanel supabase={supabase} />}
        {tab === "news" && <NewsPanel supabase={supabase} />}
        {tab === "activities" && <ActivitiesPanel supabase={supabase} />}
        {tab === "members" && isPresident && (
          <MembersPanel currentUserId={me.id} />
        )}
        {tab === "settings" && isPresident && (
          <SettingsPanel supabase={supabase} />
        )}
        {tab === "account" && <AccountPanel supabase={supabase} me={me} />}
      </div>
    </div>
  );
}