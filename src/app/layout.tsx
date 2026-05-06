import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import { PreferencesProvider } from "@/components/preferences-provider";

export const metadata: Metadata = {
  title: "ProcureAI",
  description: "AI-agent-driven procurement that listens where work already happens.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} data-density="balanced" data-agent-prominence="subtle">
      <body>
        <PreferencesProvider>{children}</PreferencesProvider>
      </body>
    </html>
  );
}
