import { createServerClient } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatRupiah } from "@/lib/utils";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SuperadminBookingsPage({ searchParams }: { searchParams: { status?: string } }) {
  const statusFilter = searchParams.status;
  let allBookings: any[] = [];

  try {
    const supabase = await createServerClient();
    let query = supabase.from("bookings").select("*").order("created_at", { ascending: false });
    if (statusFilter && statusFilter !== "all") {
      const dbStatus =
        statusFilter === "confirmed" ? "terpesan" : statusFilter === "rejected" ? "ditolak" : statusFilter;
      query = query.eq("status", dbStatus);
    }
    const { data } = await query;
    allBookings = data ?? [];
  } catch {}

  const statuses = ["all", "pending", "confirmed", "rejected", "expired"];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Semua Booking</h1>
        <p className="text-sm text-gray-500 mt-1">Daftar booking dari seluruh venue</p>
      </div>

      <div className="flex gap-2 mb-6 flex-wrap">
        {statuses.map((s) => (
          <Link key={s} href={`/superadmin/bookings${s !== "all" ? `?status=${s}` : ""}`}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${(statusFilter === s || (!statusFilter && s === "all")) ? "gradient-brand text-white shadow-md" : "bg-white border text-gray-600 hover:bg-gray-50"}`}>
            {s === "all" ? "Semua" : s === "pending" ? "Pending" : s === "confirmed" ? "Terpesan" : s === "rejected" ? "Ditolak" : "Expired"}
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
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
            {allBookings.map((b) => (
              <tr key={b.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 font-mono text-xs">{b.booking_code}</td>
                <td className="px-5 py-3"><div className="font-medium">{b.guest_name}</div><div className="text-xs text-gray-400">{b.guest_email}</div></td>
                <td className="px-5 py-3 text-gray-500">{b.booking_date}</td>
                <td className="px-5 py-3 font-medium">{formatRupiah(b.total_amount)}</td>
                <td className="px-5 py-3"><StatusBadge status={b.status} /></td>
                <td className="px-5 py-3"><Link href={`/superadmin/bookings/${b.id}`} className="text-brand-600 hover:underline text-xs">Detail →</Link></td>
              </tr>
            ))}
            {allBookings.length === 0 && <tr><td colSpan={6} className="px-5 py-12 text-center text-gray-400">Tidak ada booking</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}
