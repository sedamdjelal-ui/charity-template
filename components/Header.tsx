"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { navLinks } from "@/config/site";

function resolveHref(href: string) {
  return href.startsWith("#") ? `/${href}` : href;
}

type HeaderProps = {
  name: string;
  type: string;
  fullName: string;
  logo: string | null;
};

export default function Header({ name, type, fullName, logo }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);

  // إخفاء الشريط عند النزول وإظهاره عند الصعود
  useEffect(() => {
    let lastY = 0;

    function getY(e: Event) {
      const target = e.target;
      if (target instanceof HTMLElement) return target.scrollTop;
      return window.scrollY || document.documentElement.scrollTop;
    }

    function onScroll(e: Event) {
      const y = getY(e);
      if (y < 80) {
        setHidden(false); // قرب أعلى الصفحة: يظهر دائماً
      } else if (y > lastY + 5) {
        setHidden(true); // نزول
        setOpen(false);
      } else if (y < lastY - 5) {
        setHidden(false); // صعود
      }
      lastY = y;
    }

    document.addEventListener("scroll", onScroll, {
      passive: true,
      capture: true,
    });
    return () =>
      document.removeEventListener("scroll", onScroll, { capture: true });
  }, []);

  return (
    <header
      className="sticky top-0 z-50 border-b border-line bg-white"
      style={{
        transform: hidden && !open ? "translateY(-100%)" : "translateY(0)",
        transition: "transform 0.3s ease",
      }}
    >
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex flex-col leading-tight">
          {logo ? (
            <Image src={logo} alt={fullName} width={140} height={48} />
          ) : (
            <>
              <span className="font-heading text-2xl font-bold">{name}</span>
              <span className="text-xs text-muted">{type}</span>
            </>
          )}
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((item) => (
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
          {navLinks.map((item) => (
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