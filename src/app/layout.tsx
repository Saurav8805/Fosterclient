import type { Metadata } from "next";
import Script from "next/script";
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
      <body>
        {children}
        {/* Suppress preload warnings in development */}
        {process.env.NODE_ENV === 'development' && (
          <Script id="suppress-preload-warnings" strategy="afterInteractive">
            {`
              // Suppress resource preload warnings
              const originalWarn = console.warn;
              console.warn = function(...args) {
                if (args[0]?.includes?.('preloaded using link preload') || 
                    args[0]?.includes?.('not used within a few seconds')) {
                  return;
                }
                originalWarn.apply(console, args);
              };
            `}
          </Script>
        )}
      </body>
    </html>
  );
}