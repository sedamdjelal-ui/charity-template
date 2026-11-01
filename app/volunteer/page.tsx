import type { Metadata } from "next";
import VolunteerForm from "@/components/forms/VolunteerForm";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `تطوّع معنا | ${siteConfig.fullName}`,
};

export default function VolunteerPage() {
  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-heading text-4xl font-bold">تطوّع معنا</h1>
      <span className="mt-4 block h-px w-16 bg-ink" />
      <p className="mt-6 mb-10 leading-loose text-muted">
        وقتك ومهارتك يمكن أن يغيّرا حياة عائلة. سجّل بياناتك وسنتواصل معك عند
        تنظيم الحملات والأنشطة القادمة.
      </p>

      <VolunteerForm />
    </section>
  );
}