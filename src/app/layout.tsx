import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { NavBar } from "@/components/layout/NavBar";
import { UnitProvider } from "@/components/units/UnitProvider";
import { getUnitPreferences } from "@/lib/settings";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wiederladen",
  description: "Ladedaten, Schussgruppen und Chrono-Daten verwalten und auswerten",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const unitPrefs = await getUnitPreferences();

  return (
    <html
      lang="de"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full bg-background text-neutral-900 dark:text-neutral-100">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <UnitProvider initialPrefs={unitPrefs}>
            <div className="flex min-h-screen flex-col md:flex-row">
              <NavBar />
              <main className="min-w-0 flex-1 px-4 pb-28 pt-5 md:px-10 md:pb-12 md:pt-8">
                <div className="mx-auto w-full max-w-6xl">{children}</div>
              </main>
            </div>
          </UnitProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
