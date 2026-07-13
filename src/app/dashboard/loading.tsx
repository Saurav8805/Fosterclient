import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function DashboardLoading() {
  return (
    <div className="flex items-center justify-center h-full min-h-screen">
      <div className="text-center">
        <LoadingSpinner size="lg" className="text-[#5e3a9e] mx-auto mb-4" />
        <p className="text-gray-600 text-lg">Loading...</p>
      </div>
    </div>
  );
}
