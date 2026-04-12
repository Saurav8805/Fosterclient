import DashboardSidebar from '@/components/DashboardLayout';
import { SidebarProvider } from '@/components/ui/sidebar';
import HeaderContent from '@/components/HeaderContent';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-screen overflow-hidden">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-h-0">
          <HeaderContent />
          <main className="flex-1 h-full bg-white overflow-auto scrollbar-hide">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  )
}
