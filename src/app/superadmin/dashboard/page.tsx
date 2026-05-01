import { createServerClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatRupiah } from "@/lib/utils";
import { Clock, CheckCircle2, DollarSign, CalendarDays, Building2, Users } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SuperadminDashboard() {
  let stats = { venues: 0, courts: 0, operators: 0, bookings: 0, pending: 0, revenue: 0 };
  let recentBookings: any[] = [];

  try {
    const supabase = await createServerClient();

    const { count: venueCnt } = await supabase.from("venues").select("*", { count: "exact", head: true });
    const { count: courtCnt } = await supabase.from("courts").select("*", { count: "exact", head: true });
    const { count: operatorCnt } = await supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "operator");
    const { count: bookingCnt } = await supabase.from("bookings").select("*", { count: "exact", head: true });
    const { count: pendingCnt } = await supabase.from("bookings").select("*", { count: "exact", head: true }).eq("status", "pending");
    const { data: revenueData } = await supabase.from("bookings").select("total_amount").eq("status", "terpesan");
    const revenue = revenueData?.reduce((sum, b) => sum + (b.total_amount || 0), 0) ?? 0;

    stats = {
      venues: venueCnt ?? 0,
      courts: courtCnt ?? 0,
      operators: operatorCnt ?? 0,
      bookings: bookingCnt ?? 0,
      pending: pendingCnt ?? 0,
      revenue,
    };

    const { data: recentData } = await supabase.from("bookings").select("*").order("created_at", { ascending: false }).limit(5);
    recentBookings = recentData ?? [];
  } catch { /* DB not ready */ }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Superadmin</h1>
        <p className="text-sm text-gray-500 mt-1">Overview global semua venue dan booking</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard title="Total Venue" value={stats.venues} icon={<Building2 className="w-5 h-5" />} color="blue" />
        <StatCard title="Total Operator" value={stats.operators} icon={<Users className="w-5 h-5" />} color="green" />
        <StatCard title="Booking Pending" value={stats.pending} icon={<Clock className="w-5 h-5" />} color="yellow" />
        <StatCard title="Total Booking" value={stats.bookings} icon={<CalendarDays className="w-5 h-5" />} color="green" />
        <StatCard title="Pendapatan Total" value={formatRupiah(stats.revenue)} icon={<DollarSign className="w-5 h-5" />} color="blue" />
        <StatCard title="Total Court" value={stats.courts} icon={<CheckCircle2 className="w-5 h-5" />} color="green" />
      </div>

      <div className="bg-white rounded-2xl border shadow-sm">
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Booking Terbaru (Global)</h2>
          <Link href="/superadmin/bookings" className="text-sm text-brand-600 hover:underline">Lihat Semua →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Kode</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Pemesan</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Total</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono text-xs">{b.booking_code}</td>
                  <td className="px-5 py-3 font-medium">{b.guest_name}</td>
                  <td className="px-5 py-3">{formatRupiah(b.total_amount)}</td>
                  <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-5 py-3">
                    <Link href={`/superadmin/bookings/${b.id}`} className="text-brand-600 hover:underline text-xs font-medium">Detail</Link>
                  </td>
                </tr>
              ))}
              {recentBookings.length === 0 && <tr><td colSpan={5} className="px-5 py-10 text-center text-gray-400">Belum ada booking</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
