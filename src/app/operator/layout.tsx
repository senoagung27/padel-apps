import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default function OperatorLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <DashboardSidebar role="operator" />
      <main className="flex-1 lg:p-8 p-4 pt-16 lg:pt-8">{children}</main>
    </div>
  );
}
