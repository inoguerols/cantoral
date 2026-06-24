import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import Image from "next/image";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Cantoral — cancionero parroquial con acordes",
  description:
    "Biblioteca de canciones parroquiales con acordes: busca, transpón a tu tono y afina con el micrófono.",
  manifest: "/manifest.json",
  icons: { icon: "/icon.svg", apple: "/icon.svg" },
};

export const viewport: Viewport = {
  themeColor: "#4f46e5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <header className="sticky top-0 z-10 border-b border-black/10 bg-[var(--background)]/90 backdrop-blur dark:border-white/10">
          <nav className="mx-auto flex h-14 max-w-3xl items-center gap-4 px-4">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
              <Image src="/icon.svg" alt="" width={28} height={28} priority />
              Cantoral
            </Link>
            <div className="ml-auto flex items-center gap-1 text-sm">
              <Link
                href="/tuner"
                className="rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10"
              >
                Afinador
              </Link>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 hover:bg-black/5 dark:hover:bg-white/10"
              >
                Entrar
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
