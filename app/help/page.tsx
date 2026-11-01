import { Suspense } from "react";
import type { Metadata } from "next";
import HelpForm from "@/components/forms/HelpForm";
import { getSettings } from "@/lib/settings";
import { createPublicClient } from "@/lib/supabase/public";

export const metadata: Metadata = {
  title: "طلب مساعدة",
};

async function HelpFormLoader() {
  const supabase = createPublicClient();
  const { data } = await supabase
    .from("activities")
    .select("slug, title")
    .eq("enabled", true)
    .order("sort_order", { ascending: true });

  const needTypes = [
    ...(data ?? []).map((a) => ({
      value: a.slug as string,
      label: a.title as string,
    })),
    { value: "other", label: "أخرى" },
  ];

  return <HelpForm needTypes={needTypes} />;
}

export default async function HelpPage() {
  const { help } = await getSettings();

  return (
    <section className="mx-auto max-w-3xl px-4 py-16">
      <h1 className="font-heading text-4xl font-bold">طلب مساعدة</h1>
      <span className="mt-4 block h-px w-16 bg-ink" />
      <p className="mt-6 leading-loose text-muted">{help.intro}</p>

      {help.documents.length > 0 && (
        <div className="my-10 border border-line p-5">
          <p className="font-semibold">الوثائق التي ستُطلب منك لاحقاً:</p>
          <ul className="mt-3 list-inside list-disc space-y-1 text-muted">
            {help.documents.map((doc, i) => (
              <li key={`${doc}-${i}`}>{doc}</li>
            ))}
          </ul>
        </div>
      )}

      <Suspense
        fallback={<div className="h-96 animate-pulse border border-line" />}
      >
        <HelpFormLoader />
      </Suspense>
    </section>
  );
}