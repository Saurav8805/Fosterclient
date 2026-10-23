interface ValidationErrorProps {
  error: string | null;
  show?: boolean;
}

export default function ValidationError({ error, show = true }: ValidationErrorProps) {
  if (!error || !show) return null;

  return (
    <div className="relative mt-1">
      <div className="absolute left-0 top-0 z-10">
        {/* Arrow pointing up */}
        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-red-500 ml-3"></div>
        
        {/* Error message box */}
        <div className="bg-red-500 text-white px-2.5 py-1.5 rounded-md shadow-lg text-xs font-medium flex items-center gap-1.5 mt-0 animate-shake whitespace-nowrap">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
          <span>{error}</span>
        </div>
      </div>
    </div>
  );
}
