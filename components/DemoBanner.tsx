export default function DemoBanner() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") return null;

  return (
    <div className="bg-ink px-4 py-2 text-center text-sm text-white">
      هذا موقع تجريبي لعرض الخدمة، والجمعية والبيانات افتراضية. لا ترسل طلبات
      حقيقية ولا تحويلات مالية.{" "}
      <a
        href="https://www.djellalco.com"
        target="_blank"
        rel="noopener noreferrer"
        className="underline"
      >
        اطلب موقعاً لجمعيتك
      </a>
    </div>
  );
}