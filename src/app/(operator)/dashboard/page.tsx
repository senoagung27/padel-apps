import { createServerClient } from "@/lib/supabase/server";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatRupiah, formatDate } from "@/lib/utils";
import { Clock, CheckCircle2, DollarSign, CalendarDays } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function OperatorDashboard() {
  let stats = { pending: 0, confirmedToday: 0, revenue: 0, total: 0 };
  let recentBookings: any[] = [];

  try {
    const supabase = await createServerClient();
    const today = new Date().toISOString().slice(0, 10);

    const { data: allBookingsData } = await supabase
      .from("bookings")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);
    recentBookings = allBookingsData ?? [];

    const { count: pendingCnt } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "pending");

    const { count: confirmedTodayCnt } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true })
      .eq("status", "terpesan")
      .eq("booking_date", today);

    const { data: revenueData } = await supabase
      .from("bookings")
      .select("total_amount")
      .eq("status", "terpesan");
    const revenue = revenueData?.reduce((sum, b) => sum + (b.total_amount || 0), 0) ?? 0;

    const { count: totalCnt } = await supabase
      .from("bookings")
      .select("*", { count: "exact", head: true });

    stats = {
      pending: pendingCnt ?? 0,
      confirmedToday: confirmedTodayCnt ?? 0,
      revenue,
      total: totalCnt ?? 0,
    };
  } catch { /* DB not connected yet */ }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Operator</h1>
        <p className="text-sm text-gray-500 mt-1">Ringkasan booking dan status lapangan Anda</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Pending" value={stats.pending} icon={<Clock className="w-5 h-5" />} color="yellow" />
        <StatCard title="Terpesan Hari Ini" value={stats.confirmedToday} icon={<CheckCircle2 className="w-5 h-5" />} color="green" />
        <StatCard title="Pendapatan" value={formatRupiah(stats.revenue)} icon={<DollarSign className="w-5 h-5" />} color="blue" />
        <StatCard title="Total Booking" value={stats.total} icon={<CalendarDays className="w-5 h-5" />} color="green" />
      </div>

      {/* Recent bookings */}
      <div className="bg-white rounded-2xl border shadow-sm">
        <div className="p-5 border-b flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Booking Terbaru</h2>
          <Link href="/operator/bookings" className="text-sm text-brand-600 hover:underline">Lihat Semua →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Kode</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Pemesan</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Tanggal</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Total</th>
                <th className="px-5 py-3 text-left font-medium text-gray-500">Status</th>
                <th className="px-5 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentBookings.length > 0 ? recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-mono text-xs">{b.booking_code}</td>
                  <td className="px-5 py-3 font-medium">{b.guest_name}</td>
                  <td className="px-5 py-3 text-gray-500">{b.booking_date}</td>
                  <td className="px-5 py-3">{formatRupiah(b.total_amount)}</td>
                  <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                  <td className="px-5 py-3"><Link href={`/operator/bookings/${b.id}`} className="text-brand-600 hover:underline text-xs">Detail</Link></td>
                </tr>
              )) : (
                <tr><td colSpan={6} className="px-5 py-10 text-center text-gray-400">Belum ada booking</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
