"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { formatRupiah, formatDate } from "@/lib/utils";
import { ArrowLeft, CheckCircle2, XCircle, Loader2, User, Phone, Mail, Calendar, Clock, CreditCard, Image } from "lucide-react";

interface BookingDetail {
  id: string;
  bookingCode: string;
  status: string;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  totalAmount: number;
  transferProofUrl: string | null;
  operatorNote: string | null;
  courtName: string;
  venueName: string;
  createdAt: string;
}

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [note, setNote] = useState("");

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/operator/bookings/${params.id}`);
        if (res.ok) { const data = await res.json(); setBooking(data); setNote(data.operatorNote || ""); }
      } catch { /* */ }
      setLoading(false);
    }
    load();
  }, [params.id]);

  async function updateStatus(newStatus: "confirmed" | "rejected") {
    setUpdating(true);
    try {
      const res = await fetch(`/api/operator/bookings/${params.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, operatorNote: note }),
      });
      if (res.ok) {
        setBooking((prev) => prev ? { ...prev, status: newStatus, operatorNote: note } : null);
      }
    } catch { /* */ }
    setUpdating(false);
  }

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-brand-500" /></div>;
  if (!booking) return <div className="text-center py-20 text-gray-500">Booking tidak ditemukan</div>;

  return (
    <div>
      <button onClick={() => router.back()} className="flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm mb-6"><ArrowLeft className="w-4 h-4" />Kembali</button>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Detail Booking</h1>
          <p className="text-sm font-mono text-gray-500 mt-1">{booking.bookingCode}</p>
        </div>
        <StatusBadge status={booking.status} size="md" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border p-5 space-y-4">
            <h3 className="font-bold text-gray-900">Info Pemesan</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2"><User className="w-4 h-4 text-gray-400" /><span>{booking.guestName}</span></div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-400" /><span>{booking.guestEmail}</span></div>
              <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-400" /><span>{booking.guestPhone}</span></div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border p-5 space-y-4">
            <h3 className="font-bold text-gray-900">Info Booking</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Venue</span><span className="font-medium">{booking.venueName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Court</span><span className="font-medium">{booking.courtName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tanggal</span><span className="font-medium">{booking.bookingDate}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Waktu</span><span className="font-medium">{booking.startTime?.slice(0, 5)} - {booking.endTime?.slice(0, 5)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Durasi</span><span className="font-medium">{booking.durationHours} jam</span></div>
              <div className="flex justify-between border-t pt-2"><span className="font-semibold">Total</span><span className="font-bold text-brand-600">{formatRupiah(booking.totalAmount)}</span></div>
            </div>
          </div>
        </div>

        {/* Proof & Actions */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border p-5">
            <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Image className="w-4 h-4" />Bukti Transfer</h3>
            {booking.transferProofUrl ? (
              <img src={booking.transferProofUrl} alt="Bukti Transfer" className="w-full rounded-xl border" />
            ) : (
              <div className="py-10 text-center text-gray-400 bg-gray-50 rounded-xl"><p className="text-sm">Belum ada bukti transfer</p></div>
            )}
          </div>

          {booking.status === "pending" && (
            <div className="bg-white rounded-2xl border p-5 space-y-4">
              <h3 className="font-bold text-gray-900">Aksi</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Catatan (opsional)</label>
                <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Tambahkan catatan..." rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-sm resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => updateStatus("confirmed")} disabled={updating} className="flex-1 py-3 rounded-xl bg-green-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-green-600 disabled:opacity-50 transition-colors">
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}Konfirmasi
                </button>
                <button onClick={() => updateStatus("rejected")} disabled={updating} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold flex items-center justify-center gap-2 hover:bg-red-600 disabled:opacity-50 transition-colors">
                  {updating ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}Tolak
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
