export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-8 p-6">
      <div className="text-center">
        <h1 className="font-heading text-5xl font-bold">يد العون</h1>
        <p className="text-muted mt-2">جمعية خيرية</p>
      </div>

      <div className="flex gap-3">
        <button className="bg-action hover:bg-action-hover text-ink px-6 py-3 font-semibold transition-colors">
          تبرّع الآن
        </button>
        <button className="border border-ink px-6 py-3 font-semibold hover:bg-ink hover:text-white transition-colors">
          اطلب مساعدة
        </button>
      </div>

      <div className="w-full max-w-md border-t border-line pt-6 text-center text-muted">
        هذا نص تجريبي بخط نوتو نسخ لاختبار وضوح القراءة على الهاتف.
      </div>
    </main>
  );
}