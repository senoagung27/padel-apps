import { db } from "@/lib/db";
import { bookings, venues, venueOperators } from "@/lib/db/schema";
import { eq, and, sql, count } from "drizzle-orm";
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
    const today = new Date().toISOString().slice(0, 10);

    // Get all bookings (operator scope would filter by venue in production)
    const allBookings = await db.select().from(bookings).orderBy(sql`${bookings.createdAt} DESC`).limit(10);
    recentBookings = allBookings;

    const pendingCount = await db.select({ count: count() }).from(bookings).where(eq(bookings.status, "pending"));
    const confirmedToday = await db.select({ count: count() }).from(bookings).where(and(eq(bookings.status, "confirmed"), eq(bookings.bookingDate, today)));
    const revenueResult = await db.select({ total: sql<number>`COALESCE(SUM(${bookings.totalAmount}), 0)` }).from(bookings).where(eq(bookings.status, "confirmed"));
    const totalCount = await db.select({ count: count() }).from(bookings);

    stats = {
      pending: pendingCount[0]?.count || 0,
      confirmedToday: confirmedToday[0]?.count || 0,
      revenue: revenueResult[0]?.total || 0,
      total: totalCount[0]?.count || 0,
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
                  <td className="px-5 py-3 font-mono text-xs">{b.bookingCode}</td>
                  <td className="px-5 py-3 font-medium">{b.guestName}</td>
                  <td className="px-5 py-3 text-gray-500">{b.bookingDate}</td>
                  <td className="px-5 py-3">{formatRupiah(b.totalAmount)}</td>
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
