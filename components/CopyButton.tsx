"use client";

import { useState } from "react";

export default function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className={`shrink-0 border border-ink px-4 py-2 text-sm font-semibold transition-colors ${
        copied ? "bg-action" : "bg-white hover:bg-ink hover:text-white"
      }`}
    >
      {copied ? "تم النسخ ✓" : "نسخ"}
    </button>
  );
}