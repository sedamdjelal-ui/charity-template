"use client";

import { useState } from "react";

export type Beneficiary = {
  id: string;
  created_at: string;
  head_name: string;
  national_id: string | null;
  phone: string;
  wilaya: string;
  daira: string;
  commune: string;
  street: string | null;
  family_size: number | null;
  situation: string | null;
  notes: string | null;
  status: string;
  help_request_id: string | null;
};

export type BeneficiaryInput = Omit<
  Beneficiary,
  "id" | "created_at" | "status" | "help_request_id"
>;

export const emptyBeneficiary: BeneficiaryInput = {
  head_name: "",
  national_id: null,
  phone: "",
  wilaya: "",
  daira: "",
  commune: "",
  street: null,
  family_size: null,
  situation: null,
  notes: null,
};

type Errors = Partial<Record<keyof BeneficiaryInput, string>>;

const labelClass = "mb-2 block font-semibold";

function inputClass(hasError: boolean) {
  return `w-full bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-action ${
    hasError ? "border-2 border-ink" : "border border-ink"
  }`;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1 text-sm font-semibold">⚠ {message}</p>;
}

function validate(values: BeneficiaryInput): Errors {
  const errors: Errors = {};

  if (values.head_name.length < 3) {
    errors.head_name = "اكتب الاسم الكامل (3 أحرف على الأقل).";
  }
  if (values.national_id && !/^[0-9]{18}$/.test(values.national_id)) {
    errors.national_id = `رقم التعريف الوطني يجب أن يكون 18 رقماً بالضبط (كتبت ${values.national_id.length}).`;
  }
  if (!/^0[0-9]{8,9}$/.test(values.phone)) {
    errors.phone = "رقم الهاتف غير صحيح. مثال: 0550123456";
  }
  if (!values.wilaya) errors.wilaya = "الولاية مطلوبة.";
  if (!values.daira) errors.daira = "الدائرة مطلوبة.";
  if (!values.commune) errors.commune = "البلدية مطلوبة.";
  if (
    values.family_size !== null &&
    (values.family_size < 1 || values.family_size > 30)
  ) {
    errors.family_size = "عدد الأفراد بين 1 و 30.";
  }

  return errors;
}

export default function BeneficiaryForm({
  initial,
  saving,
  submitLabel = "حفظ",
  onSave,
  onCancel,
}: {
  initial: BeneficiaryInput;
  saving: boolean;
  submitLabel?: string;
  onSave: (values: BeneficiaryInput) => void;
  onCancel: () => void;
}) {
  const [errors, setErrors] = useState<Errors>({});

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const d = new FormData(e.currentTarget);
    const get = (key: string) => String(d.get(key) ?? "").trim();
    const familySizeRaw = get("family_size");

    const values: BeneficiaryInput = {
      head_name: get("head_name"),
      national_id: get("national_id").replace(/\s/g, "") || null,
      phone: get("phone").replace(/\s/g, ""),
      wilaya: get("wilaya"),
      daira: get("daira"),
      commune: get("commune"),
      street: get("street") || null,
      family_size: familySizeRaw ? Number(familySizeRaw) : null,
      situation: get("situation") || null,
      notes: get("notes") || null,
    };

    const found = validate(values);
    setErrors(found);

    if (Object.keys(found).length > 0) {
      const firstField = Object.keys(found)[0];
      document.getElementById(firstField)?.focus();
      return;
    }

    onSave(values);
  }

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="space-y-5 border-2 border-ink p-5"
    >
      {Object.keys(errors).length > 0 && (
        <p className="border border-ink px-4 py-3 font-semibold">
          ⚠ توجد أخطاء في النموذج، صحّحها ثم أعد الحفظ.
        </p>
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="head_name" className={labelClass}>
            اسم رب العائلة *
          </label>
          <input
            id="head_name"
            name="head_name"
            maxLength={100}
            defaultValue={initial.head_name}
            aria-invalid={!!errors.head_name}
            className={inputClass(!!errors.head_name)}
          />
          <FieldError message={errors.head_name} />
        </div>
        <div>
          <label htmlFor="national_id" className={labelClass}>
            رقم التعريف الوطني
          </label>
          <input
            id="national_id"
            name="national_id"
            dir="ltr"
            inputMode="numeric"
            maxLength={18}
            placeholder="18 رقماً"
            defaultValue={initial.national_id ?? ""}
            aria-invalid={!!errors.national_id}
            className={`${inputClass(!!errors.national_id)} text-right`}
          />
          <FieldError message={errors.national_id} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="phone" className={labelClass}>
            رقم الهاتف *
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            dir="ltr"
            maxLength={13}
            placeholder="0550123456"
            defaultValue={initial.phone}
            aria-invalid={!!errors.phone}
            className={`${inputClass(!!errors.phone)} text-right`}
          />
          <FieldError message={errors.phone} />
        </div>
        <div>
          <label htmlFor="family_size" className={labelClass}>
            عدد أفراد العائلة
          </label>
          <input
            id="family_size"
            name="family_size"
            type="number"
            defaultValue={initial.family_size ?? ""}
            aria-invalid={!!errors.family_size}
            className={inputClass(!!errors.family_size)}
          />
          <FieldError message={errors.family_size} />
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="wilaya" className={labelClass}>
            الولاية *
          </label>
          <input
            id="wilaya"
            name="wilaya"
            defaultValue={initial.wilaya}
            aria-invalid={!!errors.wilaya}
            className={inputClass(!!errors.wilaya)}
          />
          <FieldError message={errors.wilaya} />
        </div>
        <div>
          <label htmlFor="daira" className={labelClass}>
            الدائرة *
          </label>
          <input
            id="daira"
            name="daira"
            defaultValue={initial.daira}
            aria-invalid={!!errors.daira}
            className={inputClass(!!errors.daira)}
          />
          <FieldError message={errors.daira} />
        </div>
        <div>
          <label htmlFor="commune" className={labelClass}>
            البلدية *
          </label>
          <input
            id="commune"
            name="commune"
            defaultValue={initial.commune}
            aria-invalid={!!errors.commune}
            className={inputClass(!!errors.commune)}
          />
          <FieldError message={errors.commune} />
        </div>
      </div>

      <div>
        <label htmlFor="street" className={labelClass}>
          العنوان التفصيلي
        </label>
        <input
          id="street"
          name="street"
          maxLength={200}
          defaultValue={initial.street ?? ""}
          className={inputClass(false)}
        />
      </div>

      <div>
        <label htmlFor="situation" className={labelClass}>
          الوضعية
        </label>
        <input
          id="situation"
          name="situation"
          maxLength={200}
          placeholder="مثال: أرملة بدون دخل، أب مريض، أيتام..."
          defaultValue={initial.situation ?? ""}
          className={inputClass(false)}
        />
      </div>

      <div>
        <label htmlFor="notes" className={labelClass}>
          ملاحظات داخلية
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={1000}
          defaultValue={initial.notes ?? ""}
          className={inputClass(false)}
        />
        <p className="mt-1 text-sm text-muted">تظهر لأعضاء الجمعية فقط.</p>
      </div>

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="bg-action px-6 py-3 font-semibold transition-colors hover:bg-action-hover disabled:opacity-60"
        >
          {saving ? "جاري الحفظ..." : submitLabel}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="border border-ink px-6 py-3 font-semibold btn-outline"
        >
          إلغاء
        </button>
      </div>
    </form>
  );
}