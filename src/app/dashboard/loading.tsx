import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center h-full min-h-screen bg-gray-50">
      <LoadingSpinner size="lg" className="text-[#5e3a9e]" />
    </div>
  );
}
