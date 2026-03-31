import type { Metadata } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Exportigo Lite — Palet & Konteyner Yukleme Optimizasyonu",
  description: "Kolilerinizi palete, paletlerinizi konteynere hizlica yerlestirin. 3D gorsellestirme ile basit ve etkili yukleme planlama araci.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-slate-50 dark:bg-slate-950 antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
