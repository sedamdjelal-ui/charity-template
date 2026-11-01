// يستخرج الولايات والدوائر والبلديات بالعربية من مكتبة geoalgeria
// المصدر: https://github.com/yasserstudio/geoalgeria (MIT)
// التشغيل: node scripts/build-algeria.mjs

import { createRequire } from "node:module";
import { writeFileSync, mkdirSync } from "node:fs";

const require = createRequire(import.meta.url);
const dz = require("geoalgeria");

const tree = dz.wilayas
  .slice()
  .sort((a, b) => a.code - b.code)
  .map((w) => {
    const communes = dz.getCommunesByWilaya(w.code);

    // الدائرة تحمل اسم بلدية مقرّها، فنترجم اسمها من البلديات
    const frToAr = new Map(communes.map((c) => [c.name_fr, c.name_ar]));

    const groups = new Map();
    for (const c of communes) {
      const key = c.daira ?? c.name_fr;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(c.name_ar);
    }

    const dairas = [...groups.entries()]
      .map(([fr, list]) => ({
        n: frToAr.get(fr) ?? fr,
        m: list.sort((a, b) => a.localeCompare(b, "ar")),
      }))
      .sort((a, b) => a.n.localeCompare(b.n, "ar"));

    return { c: w.code, n: w.name_ar, d: dairas };
  });

mkdirSync("lib/dz", { recursive: true });
writeFileSync("lib/dz/algeria.json", JSON.stringify(tree));

const dairaCount = tree.reduce((s, w) => s + w.d.length, 0);
const communeCount = tree.reduce(
  (s, w) => s + w.d.reduce((t, d) => t + d.m.length, 0),
  0
);
const untranslated = tree.flatMap((w) =>
  w.d.filter((d) => /[A-Za-z]/.test(d.n)).map((d) => `${w.c}: ${d.n}`)
);

console.log(
  `الولايات: ${tree.length} | الدوائر: ${dairaCount} | البلديات: ${communeCount}`
);
if (untranslated.length) {
  console.log("دوائر بدون اسم عربي:", untranslated);
}