import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Foster Kids",
  description: "Foster Kids - Early Childhood Education",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
