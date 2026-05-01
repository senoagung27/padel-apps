"use client";

import { useState } from "react";
import { Search, Loader2, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { formatRupiah, formatDate } from "@/lib/utils";
import type { Metadata } from "next";

const statusConfig: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "Menunggu Verifikasi", color: "bg-amber-100 text-amber-800 border-amber-200", icon: <Clock className="w-4 h-4" /> },
  confirmed: { label: "Terpesan", color: "bg-green-100 text-green-800 border-green-200", icon: <CheckCircle2 className="w-4 h-4" /> },
  rejected: { label: "Ditolak", color: "bg-red-100 text-red-800 border-red-200", icon: <XCircle className="w-4 h-4" /> },
  expired: { label: "Expired", color: "bg-gray-100 text-gray-600 border-gray-200", icon: <AlertCircle className="w-4 h-4" /> },
};

interface BookingData {
  bookingCode: string;
  status: string;
  guestName: string;
  bookingDate: string;
  startTime: string;
  endTime: string;
  durationHours: number;
  totalAmount: number;
  courtName: string;
  venueName: string;
  operatorNote: string | null;
}

export default function CekBookingPage() {
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [booking, setBooking] = useState<BookingData | null>(null);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setBooking(null);

    try {
      const res = await fetch(`/api/bookings/cek?code=${encodeURIComponent(code)}&email=${encodeURIComponent(email)}`);
      if (res.ok) {
        const data = await res.json();
        setBooking(data);
      } else {
        setError("Booking tidak ditemukan. Pastikan kode dan email sudah benar.");
      }
    } catch {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    }
    setLoading(false);
  }

  const status = booking ? statusConfig[booking.status] || statusConfig.pending : null;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-lg mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Cek Status Booking</h1>
          <p className="text-sm text-gray-500">Masukkan kode booking dan email untuk melihat status</p>
        </div>

        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm border p-6 space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Kode Booking</label>
            <input type="text" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="PDL-XXXXXXXX-XXXXXX" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-sm font-mono" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email@contoh.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-sm" required />
          </div>
          <button type="submit" disabled={loading || !code || !email} className="w-full py-3.5 rounded-xl gradient-brand text-white font-semibold flex items-center justify-center gap-2 shadow-md shadow-brand-500/25 disabled:opacity-50 transition-all">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? "Mencari..." : "Cek Status"}
          </button>
        </form>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700 text-center">{error}</div>
        )}

        {booking && status && (
          <div className="bg-white rounded-2xl shadow-sm border p-6 space-y-4 animate-fade-in">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Kode Booking</p>
              <p className="text-2xl font-mono font-bold text-gray-900">{booking.bookingCode}</p>
            </div>
            <div className="flex justify-center">
              <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium border ${status.color}`}>
                {status.icon}{status.label}
              </span>
            </div>
            <div className="border-t pt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Venue</span><span className="font-medium">{booking.venueName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Court</span><span className="font-medium">{booking.courtName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Tanggal</span><span className="font-medium">{formatDate(booking.bookingDate)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Waktu</span><span className="font-medium">{booking.startTime?.slice(0, 5)} - {booking.endTime?.slice(0, 5)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Durasi</span><span className="font-medium">{booking.durationHours} jam</span></div>
              <div className="flex justify-between border-t pt-2"><span className="font-semibold">Total</span><span className="font-bold text-brand-600">{formatRupiah(booking.totalAmount)}</span></div>
            </div>
            {booking.operatorNote && (
              <div className="bg-gray-50 rounded-xl p-3 text-sm"><span className="font-medium text-gray-700">Catatan Operator:</span> <span className="text-gray-600">{booking.operatorNote}</span></div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
