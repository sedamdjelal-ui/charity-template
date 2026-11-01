import { cacheLife, cacheTag } from "next/cache";
import { createPublicClient } from "@/lib/supabase/public";

export type Settings = {
  name: string;
  type: string;
  fullName: string;
  tagline: string;
  intro: string;
  logo: string | null;
  heroImage: string | null;
  approval: { number: string; authority: string };
  address: { wilaya: string; daira: string; commune: string; street: string };
  contact: { phone: string; whatsapp: string; email: string; facebook: string };
  donation: { ccp: string; rip: string; accountName: string };
  about: { story: string; vision: string; mission: string; foundedYear: string };
  help: { intro: string; documents: string[] };
  stats: { value: string; label: string }[];
};

// قيم احتياطية تُستعمل فقط إذا تعذّر الاتصال بقاعدة البيانات
export const defaultSettings: Settings = {
  name: "اسم الجمعية",
  type: "جمعية خيرية",
  fullName: "اسم الجمعية الخيرية",
  tagline: "معاً نصنع الفرق",
  intro: "",
  logo: null,
  heroImage: null,
  approval: { number: "", authority: "" },
  address: { wilaya: "", daira: "", commune: "", street: "" },
  contact: { phone: "", whatsapp: "", email: "", facebook: "" },
  donation: { ccp: "", rip: "", accountName: "" },
  about: { story: "", vision: "", mission: "", foundedYear: "" },
  help: { intro: "", documents: [] },
  stats: [],
};

export async function getSettings(): Promise<Settings> {
  "use cache";
  cacheTag("settings");
  cacheLife("minutes");

  try {
    const supabase = createPublicClient();
    const { data, error } = await supabase
      .from("site_settings")
      .select("data")
      .eq("id", 1)
      .single();

    if (error || !data) return defaultSettings;

    return { ...defaultSettings, ...(data.data as Partial<Settings>) };
  } catch {
    return defaultSettings;
  }
}