"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export type Member = {
  user_id: string;
  full_name: string;
  email: string;
  role: "president" | "member";
  active: boolean;
  created_at: string;
};

type Result<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; error: string };

// التحقق أن صاحب الطلب رئيس مفعّل
async function requirePresident(): Promise<string | null> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();
  const { data } = await admin
    .from("members")
    .select("role, active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!data || !data.active || data.role !== "president") return null;
  return user.id;
}

const notAllowed = { ok: false as const, error: "هذه العملية للرئيس فقط." };

export async function listMembers(): Promise<Result<Member[]>> {
  if (!(await requirePresident())) return notAllowed;

  const admin = createAdminClient();
  const [membersRes, usersRes] = await Promise.all([
    admin
      .from("members")
      .select("user_id, full_name, role, active, created_at")
      .order("created_at", { ascending: true }),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  if (membersRes.error || usersRes.error) {
    return { ok: false, error: "تعذّر تحميل الأعضاء." };
  }

  const emails = new Map(
    usersRes.data.users.map((u) => [u.id, u.email ?? ""])
  );

  return {
    ok: true,
    data: (membersRes.data ?? []).map((m) => ({
      ...m,
      email: emails.get(m.user_id) ?? "",
    })) as Member[],
  };
}

export async function createMember(input: {
  fullName: string;
  email: string;
  password: string;
  role: "president" | "member";
}): Promise<Result> {
  if (!(await requirePresident())) return notAllowed;

  const fullName = input.fullName.trim();
  const email = input.email.trim().toLowerCase();

  if (fullName.length < 3) {
    return { ok: false, error: "اكتب اسم العضو (3 أحرف على الأقل)." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "البريد الإلكتروني غير صحيح." };
  }
  if (input.password.length < 8) {
    return { ok: false, error: "كلمة السر 8 أحرف على الأقل." };
  }
  if (!["president", "member"].includes(input.role)) {
    return { ok: false, error: "الدور غير صحيح." };
  }

  const admin = createAdminClient();

  const { data: created, error: authError } =
    await admin.auth.admin.createUser({
      email,
      password: input.password,
      email_confirm: true,
    });

  if (authError || !created.user) {
    const exists =
      authError?.code === "email_exists" ||
      authError?.message?.toLowerCase().includes("already");
    return {
      ok: false,
      error: exists
        ? "هذا البريد مسجّل مسبقاً."
        : "تعذّر إنشاء الحساب.",
    };
  }

  const { error: memberError } = await admin.from("members").insert({
    user_id: created.user.id,
    full_name: fullName,
    role: input.role,
  });

  if (memberError) {
    // تراجع: حذف الحساب حتى لا يبقى حساب بلا عضوية
    await admin.auth.admin.deleteUser(created.user.id);
    return { ok: false, error: "تعذّر تسجيل العضو." };
  }

  return { ok: true };
}

export async function setMemberActive(
  userId: string,
  active: boolean
): Promise<Result> {
  const presidentId = await requirePresident();
  if (!presidentId) return notAllowed;

  if (userId === presidentId && !active) {
    return { ok: false, error: "لا يمكنك إيقاف حسابك أنت." };
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("members")
    .update({ active })
    .eq("user_id", userId);

  if (error) return { ok: false, error: "تعذّر تغيير حالة العضو." };

  // منع الدخول نهائياً للعضو الموقوف، وإعادته عند التفعيل
  await admin.auth.admin.updateUserById(userId, {
    ban_duration: active ? "none" : "876000h",
  });

  return { ok: true };
}

export async function setMemberRole(
  userId: string,
  role: "president" | "member"
): Promise<Result> {
  const presidentId = await requirePresident();
  if (!presidentId) return notAllowed;

  if (!["president", "member"].includes(role)) {
    return { ok: false, error: "الدور غير صحيح." };
  }
  if (userId === presidentId && role !== "president") {
    return {
      ok: false,
      error: "لا يمكنك إزالة الرئاسة عن نفسك. عيّن رئيساً آخر ليفعل ذلك.",
    };
  }

  const admin = createAdminClient();
  const { error } = await admin
    .from("members")
    .update({ role })
    .eq("user_id", userId);

  if (error) return { ok: false, error: "تعذّر تغيير الدور." };
  return { ok: true };
}

export async function resetMemberPassword(
  userId: string,
  password: string
): Promise<Result> {
  if (!(await requirePresident())) return notAllowed;

  if (password.length < 8) {
    return { ok: false, error: "كلمة السر 8 أحرف على الأقل." };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    password,
  });

  if (error) return { ok: false, error: "تعذّر تغيير كلمة السر." };
  return { ok: true };
}