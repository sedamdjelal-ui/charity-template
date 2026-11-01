"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { siteConfig } from "@/config/site";

function resolveHref(href: string) {
  return href.startsWith("#") ? `/${href}` : href;
}

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-white">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex flex-col leading-tight">
          {siteConfig.logo ? (
            <Image
              src={siteConfig.logo}
              alt={siteConfig.fullName}
              width={140}
              height={48}
            />
          ) : (
            <>
              <span className="font-heading text-2xl font-bold">
                {siteConfig.name}
              </span>
              <span className="text-xs text-muted">{siteConfig.type}</span>
            </>
          )}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={resolveHref(item.href)}
              className="transition-colors hover:text-muted"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/#donate"
            className="bg-action px-5 py-2 font-semibold transition-colors hover:bg-action-hover"
          >
            تبرّع
          </Link>
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex h-10 w-10 items-center justify-center border border-ink md:hidden"
            aria-label="القائمة"
            aria-expanded={open}
          >
            <span className="text-xl leading-none">{open ? "✕" : "☰"}</span>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line md:hidden">
          {siteConfig.nav.map((item) => (
            <Link
              key={item.href}
              href={resolveHref(item.href)}
              onClick={() => setOpen(false)}
              className="block border-b border-line px-4 py-4"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}