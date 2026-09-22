// This file disables Web Vitals errors in development
// Reference: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

export async function register() {
  if (process.env.NODE_ENV === 'development') {
    // Patch global error handlers to suppress web vitals errors
    if (typeof window !== 'undefined') {
      const originalError = window.console.error;
      window.console.error = (...args: any[]) => {
        const errorString = args[0]?.toString?.() || '';
        
        // Suppress known web vitals errors
        if (
          errorString.includes('startTime') ||
          errorString.includes('reportAllChanges') ||
          errorString.includes('web-vitals')
        ) {
          return;
        }
        
        originalError.apply(window.console, args);
      };
    }
  }
}
