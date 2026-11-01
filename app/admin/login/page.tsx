import type { Metadata } from "next";
import LoginForm from "@/components/admin/LoginForm";

export const metadata: Metadata = {
  title: "دخول الأعضاء",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <section className="mx-auto max-w-md px-4 py-20">
      <h1 className="font-heading text-4xl font-bold">دخول الأعضاء</h1>
      <span className="mt-4 block h-px w-16 bg-ink" />
      <p className="mt-6 mb-10 text-muted">
        هذه الصفحة خاصة بأعضاء الجمعية لإدارة الطلبات.
      </p>
      <LoginForm />
    </section>
  );
}