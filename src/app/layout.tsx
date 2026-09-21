import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smash Burger House",
  description: "Painel administrativo e cardápio digital",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}