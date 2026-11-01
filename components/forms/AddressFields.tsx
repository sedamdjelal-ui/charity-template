"use client";

import { useState } from "react";
import data from "@/lib/dz/algeria.json";

type Daira = { n: string; m: string[] };
type Wilaya = { c: number; n: string; d: Daira[] };

const wilayas = data as Wilaya[];

type AddressErrors = { wilaya?: string; daira?: string; commune?: string };

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm font-semibold">⚠ {message}</p>;
}

export default function AddressFields({
  defaults,
  errors = {},
  inputClass,
  labelClass,
}: {
  defaults?: { wilaya?: string; daira?: string; commune?: string };
  errors?: AddressErrors;
  inputClass: (hasError: boolean) => string;
  labelClass: string;
}) {
  const [wilaya, setWilaya] = useState(defaults?.wilaya ?? "");
  const [daira, setDaira] = useState(defaults?.daira ?? "");
  const [commune, setCommune] = useState(defaults?.commune ?? "");

  const selectedWilaya = wilayas.find((w) => w.n === wilaya);
  const dairas = selectedWilaya?.d ?? [];
  const selectedDaira = dairas.find((d) => d.n === daira);
  const communes = selectedDaira?.m ?? [];

  // قيم قديمة غير موجودة في القائمة (بيانات سُجّلت قبل القوائم)
  const legacyWilaya = wilaya && !selectedWilaya ? wilaya : null;
  const legacyDaira = daira && !selectedDaira ? daira : null;
  const legacyCommune = commune && !communes.includes(commune) ? commune : null;

  return (
    <div className="grid gap-5 sm:grid-cols-3">
      <div>
        <label htmlFor="wilaya" className={labelClass}>
          الولاية *
        </label>
        <select
          id="wilaya"
          name="wilaya"
          value={wilaya}
          onChange={(e) => {
            setWilaya(e.target.value);
            setDaira("");
            setCommune("");
          }}
          aria-invalid={!!errors.wilaya}
          className={inputClass(!!errors.wilaya)}
        >
          <option value="">اختر الولاية</option>
          {legacyWilaya && <option value={legacyWilaya}>{legacyWilaya}</option>}
          {wilayas.map((w) => (
            <option key={w.c} value={w.n}>
              {String(w.c).padStart(2, "0")} - {w.n}
            </option>
          ))}
        </select>
        <FieldError message={errors.wilaya} />
      </div>

      <div>
        <label htmlFor="daira" className={labelClass}>
          الدائرة *
        </label>
        <select
          id="daira"
          name="daira"
          value={daira}
          onChange={(e) => {
            setDaira(e.target.value);
            setCommune("");
          }}
          disabled={!wilaya}
          aria-invalid={!!errors.daira}
          className={`${inputClass(!!errors.daira)} disabled:opacity-50`}
        >
          <option value="">{wilaya ? "اختر الدائرة" : "اختر الولاية أولاً"}</option>
          {legacyDaira && <option value={legacyDaira}>{legacyDaira}</option>}
          {dairas.map((d) => (
            <option key={d.n} value={d.n}>
              {d.n}
            </option>
          ))}
        </select>
        <FieldError message={errors.daira} />
      </div>

      <div>
        <label htmlFor="commune" className={labelClass}>
          البلدية *
        </label>
        <select
          id="commune"
          name="commune"
          value={commune}
          onChange={(e) => setCommune(e.target.value)}
          disabled={!daira}
          aria-invalid={!!errors.commune}
          className={`${inputClass(!!errors.commune)} disabled:opacity-50`}
        >
          <option value="">{daira ? "اختر البلدية" : "اختر الدائرة أولاً"}</option>
          {legacyCommune && (
            <option value={legacyCommune}>{legacyCommune}</option>
          )}
          {communes.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <FieldError message={errors.commune} />
      </div>
    </div>
  );
}