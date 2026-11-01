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

type Check = { ok: true; userId: string } | { ok: false; error: string };

// التحقق أن صاحب الطلب رئيس مفعّل، مع سبب واضح عند الفشل
async function requirePresident(): Promise<Check> {
  const supabase = await createServerSupabase();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("[members] no user session:", authError?.message);
    return {
      ok: false,
      error: "لم يتم التعرف على جلسة الدخول. اخرج ثم ادخل من جديد.",
    };
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("members")
    .select("role, active")
    .eq("user_id", user.id)
    .maybeSingle();

  if (error) {
    console.error("[members] admin query failed:", error.message);
    return {
      ok: false,
      error:
        "تعذّر التحقق من الصلاحيات. تأكد أن SUPABASE_SECRET_KEY هو المفتاح السري (sb_secret_) وليس العام.",
    };
  }

  if (!data) {
    console.error("[members] user is not in members table:", user.id);
    return { ok: false, error: "حسابك غير مسجّل في جدول الأعضاء." };
  }

  if (!data.active || data.role !== "president") {
    return { ok: false, error: "هذه العملية للرئيس فقط." };
  }

  return { ok: true, userId: user.id };
}

export async function listMembers(): Promise<Result<Member[]>> {
  const check = await requirePresident();
  if (!check.ok) return check;

  const admin = createAdminClient();
  const [membersRes, usersRes] = await Promise.all([
    admin
      .from("members")
      .select("user_id, full_name, role, active, created_at")
      .order("created_at", { ascending: true }),
    admin.auth.admin.listUsers({ perPage: 1000 }),
  ]);

  if (membersRes.error || usersRes.error) {
    console.error(
      "[members] list failed:",
      membersRes.error?.message,
      usersRes.error?.message
    );
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
  const check = await requirePresident();
  if (!check.ok) return check;

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
    console.error("[members] create user failed:", authError?.message);
    const exists =
      authError?.code === "email_exists" ||
      authError?.message?.toLowerCase().includes("already");
    return {
      ok: false,
      error: exists ? "هذا البريد مسجّل مسبقاً." : "تعذّر إنشاء الحساب.",
    };
  }

  const { error: memberError } = await admin.from("members").insert({
    user_id: created.user.id,
    full_name: fullName,
    role: input.role,
  });

  if (memberError) {
    console.error("[members] insert member failed:", memberError.message);
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
  const check = await requirePresident();
  if (!check.ok) return check;

  if (userId === check.userId && !active) {
    return { ok: false, error: "لا يمكنك إيقاف حسابك أنت." };
  }

  const admin = createAdminClient();

  const { error } = await admin
    .from("members")
    .update({ active })
    .eq("user_id", userId);

  if (error) {
    console.error("[members] set active failed:", error.message);
    return { ok: false, error: "تعذّر تغيير حالة العضو." };
  }

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
  const check = await requirePresident();
  if (!check.ok) return check;

  if (!["president", "member"].includes(role)) {
    return { ok: false, error: "الدور غير صحيح." };
  }
  if (userId === check.userId && role !== "president") {
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

  if (error) {
    console.error("[members] set role failed:", error.message);
    return { ok: false, error: "تعذّر تغيير الدور." };
  }
  return { ok: true };
}

export async function resetMemberPassword(
  userId: string,
  password: string
): Promise<Result> {
  const check = await requirePresident();
  if (!check.ok) return check;

  if (password.length < 8) {
    return { ok: false, error: "كلمة السر 8 أحرف على الأقل." };
  }

  const admin = createAdminClient();
  const { error } = await admin.auth.admin.updateUserById(userId, {
    password,
  });

  if (error) {
    console.error("[members] reset password failed:", error.message);
    return { ok: false, error: "تعذّر تغيير كلمة السر." };
  }
  return { ok: true };
}