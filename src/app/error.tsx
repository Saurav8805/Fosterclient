'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Suppress web vitals errors
    if (
      error.message?.includes('startTime') ||
      error.message?.includes('reportAllChanges') ||
      error.message?.includes('web-vitals')
    ) {
      // Silently ignore
      return;
    }
    
    // Log other errors
    console.error('Application error:', error);
  }, [error]);

  // Don't show error UI for web vitals errors
  if (
    error.message?.includes('startTime') ||
    error.message?.includes('reportAllChanges') ||
    error.message?.includes('web-vitals')
  ) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-red-600 mb-4">
          Something went wrong!
        </h2>
        <p className="text-gray-600 mb-6">
          An unexpected error occurred. Please try again.
        </p>
        <button
          onClick={reset}
          className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
