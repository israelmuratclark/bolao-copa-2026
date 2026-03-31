import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bolão Copa 2026",
  description: "Participe do bolão da Copa do Mundo 2026! Aposte nos placares e concorra a prêmios.",
  keywords: ["bolão", "copa do mundo", "2026", "apostas", "futebol"],
  openGraph: {
    title: "Bolão Copa 2026",
    description: "Aposte nos placares da Copa do Mundo 2026 e concorra a prêmios!",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
