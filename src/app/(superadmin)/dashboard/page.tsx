import { db } from "@/lib/db";
import { bookings, venues, courts, users } from "@/lib/db/schema";
import { sql, count, eq } from "drizzle-orm";
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
    const [venueCount] = await db.select({ count: count() }).from(venues);
    const [courtCount] = await db.select({ count: count() }).from(courts);
    const [operatorCount] = await db.select({ count: count() }).from(users).where(eq(users.role, "operator"));
    const [bookingCount] = await db.select({ count: count() }).from(bookings);
    const [pendingCount] = await db.select({ count: count() }).from(bookings).where(eq(bookings.status, "pending"));
    const [revenueResult] = await db.select({ total: sql<number>`COALESCE(SUM(${bookings.totalAmount}), 0)` }).from(bookings).where(eq(bookings.status, "confirmed"));

    stats = {
      venues: venueCount?.count || 0,
      courts: courtCount?.count || 0,
      operators: operatorCount?.count || 0,
      bookings: bookingCount?.count || 0,
      pending: pendingCount?.count || 0,
      revenue: revenueResult?.total || 0,
    };

    recentBookings = await db.select().from(bookings).orderBy(sql`${bookings.createdAt} DESC`).limit(5);
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
              </tr>
            </thead>
            <tbody className="divide-y">
              {recentBookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="px-5 py-3 font-mono text-xs">{b.bookingCode}</td>
                  <td className="px-5 py-3 font-medium">{b.guestName}</td>
                  <td className="px-5 py-3">{formatRupiah(b.totalAmount)}</td>
                  <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                </tr>
              ))}
              {recentBookings.length === 0 && <tr><td colSpan={4} className="px-5 py-10 text-center text-gray-400">Belum ada booking</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
