import type { Metadata } from "next";
import Script from "next/script";
import GoogleTranslateLoader from "@/components/GoogleTranslateLoader";
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
        {/* Load error suppressor FIRST - before any other script */}
        <script src="/error-suppressor.js" />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_API_URL} />
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL} />
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_SUPABASE_URL} />
        {/* Global error suppression - Must be in head to run before other scripts */}
        <Script id="global-error-handler" strategy="beforeInteractive">
          {`
            // Global error handler to suppress web vitals errors
            window.addEventListener('error', function(event) {
              if (event.error?.message?.includes('startTime') || 
                  event.error?.message?.includes('reportAllChanges') ||
                  event.message?.includes('startTime')) {
                event.preventDefault();
                event.stopPropagation();
                return false;
              }
            }, true);

            window.addEventListener('unhandledrejection', function(event) {
              if (event.reason?.message?.includes('startTime')) {
                event.preventDefault();
                return false;
              }
            });

            // Override console methods immediately
            const originalError = console.error;
            console.error = function(...args) {
              const errorStr = args.join(' ');
              if (errorStr.includes('startTime') || 
                  errorStr.includes('reportAllChanges') ||
                  errorStr.includes('web-vitals')) {
                return;
              }
              originalError.apply(console, args);
            };
          `}
        </Script>
      </head>
      <body>
        <GoogleTranslateLoader />
        {children}
        {/* Additional runtime error suppression */}
        <Script id="suppress-warnings" strategy="afterInteractive">
          {`
            (function() {
              // Suppress resource preload warnings
              const originalWarn = console.warn;
              console.warn = function(...args) {
                if (args[0]?.includes?.('preloaded using link preload') || 
                    args[0]?.includes?.('not used within a few seconds')) {
                  return;
                }
                originalWarn.apply(console, args);
              };

              // Patch PerformanceObserver to safely handle missing entries
              if (typeof window !== 'undefined' && window.PerformanceObserver) {
                const OriginalPerformanceObserver = window.PerformanceObserver;
                
                window.PerformanceObserver = function(callback) {
                  const wrappedCallback = function(list, observer) {
                    try {
                      // Safely get entries
                      const entries = list.getEntries ? list.getEntries() : [];
                      
                      // Validate entries have required properties
                      const validEntries = entries.filter(entry => {
                        return entry && typeof entry.startTime !== 'undefined';
                      });
                      
                      if (validEntries.length > 0) {
                        callback(list, observer);
                      }
                    } catch (e) {
                      // Silently ignore errors related to startTime
                      if (!e?.message?.includes('startTime') && 
                          !e?.message?.includes('reportAllChanges')) {
                        console.error('PerformanceObserver error:', e);
                      }
                    }
                  };
                  
                  return new OriginalPerformanceObserver(wrappedCallback);
                };
                
                // Preserve prototype
                window.PerformanceObserver.prototype = OriginalPerformanceObserver.prototype;
                window.PerformanceObserver.supportedEntryTypes = OriginalPerformanceObserver.supportedEntryTypes;
              }

              // Wrap setTimeout and setInterval to catch errors
              const originalSetTimeout = window.setTimeout;
              window.setTimeout = function(fn, delay, ...args) {
                const wrappedFn = function() {
                  try {
                    return fn.apply(this, arguments);
                  } catch (e) {
                    if (!e?.message?.includes('startTime')) {
                      throw e;
                    }
                  }
                };
                return originalSetTimeout.call(window, wrappedFn, delay, ...args);
              };
            })();
          `}
        </Script>
      </body>
    </html>
  );
}