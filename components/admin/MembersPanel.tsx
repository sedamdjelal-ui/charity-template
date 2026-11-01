"use client";

import { useCallback, useEffect, useState } from "react";
import CopyButton from "@/components/CopyButton";
import {
  listMembers,
  createMember,
  setMemberActive,
  setMemberRole,
  resetMemberPassword,
  type Member,
} from "@/app/admin/members-actions";

type Credentials = { name: string; text: string };

const inputClass =
  "w-full border border-ink bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-action";
const labelClass = "mb-2 block font-semibold";

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const values = new Uint32Array(10);
  crypto.getRandomValues(values);
  return Array.from(values, (n) => chars[n % chars.length]).join("");
}

function buildCredentials(email: string, password: string) {
  return [
    `رابط الدخول: ${window.location.origin}/admin/login`,
    `البريد: ${email}`,
    `كلمة السر: ${password}`,
  ].join("\n");
}

export default function MembersPanel({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [resettingId, setResettingId] = useState<string | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [credentials, setCredentials] = useState<Credentials | null>(null);
  const [error, setError] = useState("");

  const loadMembers = useCallback(async () => {
    const res = await listMembers();
    if (!res.ok) {
      setError(res.error);
    } else {
      setError("");
      setMembers(res.data ?? []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadMembers();
  }, [loadMembers]);

  async function handleCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setCredentials(null);

    const d = new FormData(e.currentTarget);
    const fullName = String(d.get("full_name") || "").trim();
    const email = String(d.get("email") || "").trim().toLowerCase();
    const role = String(d.get("role")) as "president" | "member";

    setSaving(true);
    const res = await createMember({
      fullName,
      email,
      password: newPassword,
      role,
    });
    setSaving(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    setCredentials({
      name: fullName,
      text: buildCredentials(email, newPassword),
    });
    setAdding(false);
    setNewPassword("");
    await loadMembers();
  }

  async function toggleActive(m: Member) {
    setError("");
    const res = await setMemberActive(m.user_id, !m.active);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    await loadMembers();
  }

  async function toggleRole(m: Member) {
    setError("");
    const newRole = m.role === "president" ? "member" : "president";
    const confirmed = window.confirm(
      newRole === "president"
        ? `جعل «${m.full_name}» رئيساً؟ سيتمكن من إدارة الأعضاء والإعدادات.`
        : `إزالة الرئاسة عن «${m.full_name}»؟`
    );
    if (!confirmed) return;

    const res = await setMemberRole(m.user_id, newRole);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    await loadMembers();
  }

  async function handleReset(m: Member) {
    setError("");
    setSaving(true);
    const res = await resetMemberPassword(m.user_id, resetPassword);
    setSaving(false);

    if (!res.ok) {
      setError(res.error);
      return;
    }

    setCredentials({
      name: m.full_name,
      text: buildCredentials(m.email, resetPassword),
    });
    setResettingId(null);
    setResetPassword("");
  }

  if (loading) {
    return <p className="py-12 text-center text-muted">جاري تحميل الأعضاء...</p>;
  }

  return (
    <div>
      {/* الأزرار العلوية */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setAdding(true);
            setNewPassword(generatePassword());
            setCredentials(null);
            setError("");
          }}
          disabled={adding}
          className="bg-action px-5 py-2 font-semibold transition-colors hover:bg-action-hover disabled:opacity-60"
        >
          + إضافة عضو
        </button>
        <button
          type="button"
          onClick={loadMembers}
          className="ms-auto border border-ink px-4 py-2 text-sm font-semibold btn-outline"
        >
          تحديث ⟳
        </button>
      </div>

      {error && (
        <p className="mt-6 border border-ink px-4 py-3 font-semibold">⚠ {error}</p>
      )}

      {/* بيانات الدخول للمشاركة */}
      {credentials && (
        <div className="mt-6 border-2 border-ink p-5">
          <p className="font-semibold">
            ✓ بيانات دخول «{credentials.name}» جاهزة. انسخها وأرسلها له:
          </p>
          <pre
            dir="rtl"
            className="mt-4 whitespace-pre-wrap border border-line bg-white p-4 font-body"
          >
            {credentials.text}
          </pre>
          <div className="mt-4 flex gap-3">
            <CopyButton text={credentials.text} />
            <button
              type="button"
              onClick={() => setCredentials(null)}
              className="border border-ink px-4 py-2 text-sm font-semibold btn-outline"
            >
              تم
            </button>
          </div>
          <p className="mt-3 text-sm text-muted">
            لن تظهر كلمة السر مرة أخرى. انصح العضو بتغييرها من تبويب «حسابي».
          </p>
        </div>
      )}

      {/* نموذج الإضافة */}
      {adding && (
        <form
          onSubmit={handleCreate}
          className="mt-6 space-y-5 border-2 border-ink p-5"
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="full_name" className={labelClass}>
                اسم العضو *
              </label>
              <input
                id="full_name"
                name="full_name"
                required
                minLength={3}
                maxLength={100}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>
                البريد الإلكتروني *
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                dir="ltr"
                className={`${inputClass} text-right`}
              />
            </div>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="password" className={labelClass}>
                كلمة سر مؤقتة *
              </label>
              <div className="flex gap-2">
                <input
                  id="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  minLength={8}
                  dir="ltr"
                  className={`${inputClass} text-right font-mono`}
                />
                <button
                  type="button"
                  onClick={() => setNewPassword(generatePassword())}
                  className="shrink-0 border border-ink px-3 text-sm font-semibold btn-outline"
                >
                  توليد
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="role" className={labelClass}>
                الدور
              </label>
              <select
                id="role"
                name="role"
                defaultValue="member"
                className={inputClass}
              >
                <option value="member">عضو</option>
                <option value="president">رئيس</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-action px-6 py-3 font-semibold transition-colors hover:bg-action-hover disabled:opacity-60"
            >
              {saving ? "جاري الإنشاء..." : "إنشاء الحساب"}
            </button>
            <button
              type="button"
              onClick={() => {
                setAdding(false);
                setError("");
              }}
              className="border border-ink px-6 py-3 font-semibold btn-outline"
            >
              إلغاء
            </button>
          </div>
        </form>
      )}

      {/* قائمة الأعضاء */}
      <div className="mt-6 space-y-4">
        {members.map((m) => {
          const isMe = m.user_id === currentUserId;

          return (
            <article
              key={m.user_id}
              className={`border border-ink p-5 ${m.active ? "" : "opacity-60"}`}
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h3 className="font-heading text-xl font-bold">
                    {m.full_name}
                    {isMe && (
                      <span className="font-body text-sm font-normal text-muted">
                        {" "}(أنت)
                      </span>
                    )}
                  </h3>
                  <p className="text-sm text-muted" dir="ltr">
                    {m.email}
                  </p>
                  <p className="mt-1 text-sm">
                    <span className="font-semibold">
                      {m.role === "president" ? "رئيس" : "عضو"}
                    </span>
                    <span className="text-muted">
                      {" "}· {m.active ? "مفعّل" : "موقوف"}
                    </span>
                  </p>
                </div>

                {!isMe && (
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleRole(m)}
                      className="border border-ink px-3 py-2 text-sm font-semibold btn-outline"
                    >
                      {m.role === "president" ? "جعله عضواً" : "جعله رئيساً"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setResettingId(m.user_id);
                        setResetPassword(generatePassword());
                        setCredentials(null);
                      }}
                      className="border border-ink px-3 py-2 text-sm font-semibold btn-outline"
                    >
                      كلمة سر جديدة
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleActive(m)}
                      className="border border-ink px-3 py-2 text-sm font-semibold btn-outline"
                    >
                      {m.active ? "إيقاف" : "تفعيل"}
                    </button>
                  </div>
                )}
              </div>

              {resettingId === m.user_id && (
                <div className="mt-4 flex flex-col gap-2 border-t border-line pt-4 sm:flex-row">
                  <input
                    value={resetPassword}
                    onChange={(e) => setResetPassword(e.target.value)}
                    dir="ltr"
                    className={`${inputClass} text-right font-mono`}
                  />
                  <button
                    type="button"
                    onClick={() => handleReset(m)}
                    disabled={saving}
                    className="shrink-0 bg-action px-5 py-2 font-semibold transition-colors hover:bg-action-hover disabled:opacity-60"
                  >
                    {saving ? "جاري الحفظ..." : "حفظ كلمة السر"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setResettingId(null)}
                    className="shrink-0 border border-ink px-5 py-2 font-semibold btn-outline"
                  >
                    إلغاء
                  </button>
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}