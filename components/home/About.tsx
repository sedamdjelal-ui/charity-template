import { getSettings } from "@/lib/settings";

export default async function About() {
  const { about } = await getSettings();

  return (
    <section id="about" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-20">
      <div className="grid gap-12 md:grid-cols-2 md:items-center">
        <div>
          {about.foundedYear && (
            <p className="text-sm text-muted">منذ {about.foundedYear}</p>
          )}
          <h2 className="mt-2 font-heading text-3xl font-bold md:text-4xl">
            من نحن
          </h2>
          <span className="mt-4 block h-px w-16 bg-ink" />
          <p className="mt-6 text-lg leading-loose text-muted">{about.story}</p>
        </div>

        <div className="space-y-6">
          {about.vision && (
            <div className="border border-ink p-6">
              <h3 className="font-heading text-2xl font-bold">رؤيتنا</h3>
              <p className="mt-3 leading-relaxed text-muted">{about.vision}</p>
            </div>
          )}
          {about.mission && (
            <div className="border border-ink p-6">
              <h3 className="font-heading text-2xl font-bold">رسالتنا</h3>
              <p className="mt-3 leading-relaxed text-muted">{about.mission}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}