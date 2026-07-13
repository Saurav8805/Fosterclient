import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Foster Kids",
  description: "Foster Kids - Early Childhood Education",
  keywords: ["Foster Kids", "Early Childhood Education", "School Management"],
  authors: [{ name: "Foster Kids" }],
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL} />
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL} />
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
      </head>
      <body>{children}</body>
    </html>
  );
}