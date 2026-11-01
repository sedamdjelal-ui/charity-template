import type { Metadata } from "next";
import { Amiri, Noto_Naskh_Arabic } from "next/font/google";
import "./globals.css";

const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
});

const naskh = Noto_Naskh_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-naskh",
  display: "swap",
});

export const metadata: Metadata = {
  title: "جمعية يد العون الخيرية",
  description: "جمعية خيرية للتضامن ومساعدة العائلات المحتاجة",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={`${amiri.variable} ${naskh.variable}`}>
      <body className="bg-white text-ink font-body antialiased">
        {children}
      </body>
    </html>
  );
}