// Helper component for displaying information fields in profile
export function InfoField({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-sm font-medium text-neutral-600">
        <span className="text-blue-600">{icon}</span>
        {label}
      </label>
      <div className="px-4 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 font-medium min-h-[44px] flex items-center">
        {value || <span className="text-neutral-400">Not provided</span>}
      </div>
    </div>
  )
}
