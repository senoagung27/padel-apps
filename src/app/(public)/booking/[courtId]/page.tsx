"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { BookingStepper } from "@/components/public/booking-stepper";
import { TimeSlotGrid, type SlotData } from "@/components/public/time-slot-grid";
import { formatRupiah, formatDate } from "@/lib/utils";
import { ArrowLeft, ArrowRight, Upload, Loader2, CheckCircle2, User, Phone, Mail, CreditCard, Calendar as CalendarIcon } from "lucide-react";

const STEPS = ["Pilih Waktu", "Isi Data", "Pembayaran", "Konfirmasi"];

// Default time slots 08:00–22:00
function generateDefaultSlots(): SlotData[] {
  const slots: SlotData[] = [];
  for (let h = 8; h < 22; h++) {
    slots.push({
      startTime: `${h.toString().padStart(2, "0")}:00:00`,
      endTime: `${(h + 1).toString().padStart(2, "0")}:00:00`,
      isAvailable: true,
      isActive: true,
    });
  }
  return slots;
}

interface CourtInfo {
  id: string;
  name: string;
  pricePerHour: number;
  venue: { id: string; name: string; slug: string; bankName: string | null; bankAccount: string | null; bankHolder: string | null };
}

export default function BookingPage({ params }: { params: { courtId: string } }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [court, setCourt] = useState<CourtInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Step 1: Date & time
  const [selectedDate, setSelectedDate] = useState(() => {
    const d = new Date();
    return d.toISOString().slice(0, 10);
  });
  const [slots, setSlots] = useState<SlotData[]>(generateDefaultSlots());
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);

  // Step 2: Guest data
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  // Step 3: Payment
  const [transferProof, setTransferProof] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Step 4: Confirmation
  const [bookingResult, setBookingResult] = useState<{ bookingCode: string } | null>(null);

  // Load court info
  useEffect(() => {
    async function loadCourt() {
      try {
        const res = await fetch(`/api/courts/${params.courtId}`);
        if (res.ok) {
          const data = await res.json();
          setCourt(data);
        }
      } catch { /* fallback */ }
      setLoading(false);
    }
    loadCourt();
  }, [params.courtId]);

  // Load availability when date changes
  useEffect(() => {
    async function loadAvailability() {
      try {
        const res = await fetch(`/api/courts/${params.courtId}/availability?date=${selectedDate}`);
        if (res.ok) {
          const data = await res.json();
          setSlots(data.slots || generateDefaultSlots());
        }
      } catch { /* use defaults */ }
    }
    loadAvailability();
    setSelectedSlots([]);
  }, [selectedDate, params.courtId]);

  function handleToggleSlot(startTime: string) {
    setSelectedSlots((prev) =>
      prev.includes(startTime)
        ? prev.filter((s) => s !== startTime)
        : [...prev, startTime].sort()
    );
  }

  const totalHours = selectedSlots.length;
  const totalAmount = totalHours * (court?.pricePerHour || 0);

  async function handleSubmitBooking() {
    if (!court) return;
    setSubmitting(true);

    try {
      // Upload proof if provided
      let transferProofUrl = "";
      if (transferProof) {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", transferProof);
        const uploadRes = await fetch("/api/upload/transfer-proof", { method: "POST", body: formData });
        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          transferProofUrl = uploadData.url;
        }
        setUploading(false);
      }

      // Sort selected slots to get start/end
      const sorted = [...selectedSlots].sort();
      const startTime = sorted[0];
      const lastStart = sorted[sorted.length - 1];
      const endHour = parseInt(lastStart.split(":")[0]) + 1;
      const endTime = `${endHour.toString().padStart(2, "0")}:00:00`;

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          courtId: params.courtId,
          venueId: court.venue.id,
          guestName,
          guestEmail,
          guestPhone,
          bookingDate: selectedDate,
          startTime,
          endTime,
          durationHours: totalHours,
          totalAmount,
          transferProofUrl,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setBookingResult(data);
        setStep(4);
      }
    } catch { /* error */ }
    setSubmitting(false);
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <div className="mb-6">
          <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 text-gray-500 hover:text-gray-700 text-sm mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />Kembali
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Booking {court?.name}</h1>
          {court && <p className="text-sm text-gray-500 mt-1">{court.venue.name}</p>}
        </div>

        <BookingStepper currentStep={step} steps={STEPS} />

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-6">
          {/* Step 1: Pick date & time */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  <CalendarIcon className="w-4 h-4 inline mr-1.5" />Pilih Tanggal
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  min={new Date().toISOString().slice(0, 10)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Pilih Slot Waktu</label>
                <TimeSlotGrid slots={slots} selectedSlots={selectedSlots} onToggleSlot={handleToggleSlot} />
              </div>
              {selectedSlots.length > 0 && (
                <div className="bg-brand-50 rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-brand-800">{totalHours} jam dipilih</p>
                    <p className="text-xs text-brand-600">{formatDate(selectedDate)}</p>
                  </div>
                  <p className="text-lg font-bold text-brand-700">{formatRupiah(totalAmount)}</p>
                </div>
              )}
              <button
                onClick={() => setStep(2)}
                disabled={selectedSlots.length === 0}
                className="w-full py-3.5 rounded-xl gradient-brand text-white font-semibold flex items-center justify-center gap-2 shadow-md shadow-brand-500/25 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Lanjutkan <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Step 2: Guest data */}
          {step === 2 && (
            <div className="space-y-5">
              <h3 className="text-lg font-bold text-gray-900">Data Pemesan</h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5"><User className="w-3.5 h-3.5 inline mr-1" />Nama Lengkap</label>
                <input type="text" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Masukkan nama lengkap" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5"><Phone className="w-3.5 h-3.5 inline mr-1" />Nomor HP</label>
                <input type="tel" value={guestPhone} onChange={(e) => setGuestPhone(e.target.value)} placeholder="08xxxxxxxxxx" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5"><Mail className="w-3.5 h-3.5 inline mr-1" />Email</label>
                <input type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="email@contoh.com" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all text-sm" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">Kembali</button>
                <button
                  onClick={() => setStep(3)}
                  disabled={!guestName || !guestPhone || !guestEmail}
                  className="flex-1 py-3.5 rounded-xl gradient-brand text-white font-semibold flex items-center justify-center gap-2 shadow-md shadow-brand-500/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Lanjutkan <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Payment & upload */}
          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-bold text-gray-900">Ringkasan & Pembayaran</h3>
              {/* Summary */}
              <div className="bg-gray-50 rounded-xl p-5 space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500">Court</span><span className="font-medium">{court?.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Tanggal</span><span className="font-medium">{formatDate(selectedDate)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Durasi</span><span className="font-medium">{totalHours} jam</span></div>
                <div className="flex justify-between"><span className="text-gray-500">Pemesan</span><span className="font-medium">{guestName}</span></div>
                <div className="border-t pt-3 flex justify-between"><span className="font-semibold text-gray-700">Total</span><span className="text-lg font-bold text-brand-600">{formatRupiah(totalAmount)}</span></div>
              </div>
              {/* Bank info */}
              <div className="border-2 border-dashed border-brand-200 rounded-xl p-5 bg-brand-50/50">
                <div className="flex items-center gap-2 mb-3"><CreditCard className="w-5 h-5 text-brand-600" /><h4 className="font-semibold text-brand-800">Transfer ke Rekening</h4></div>
                <div className="space-y-1.5 text-sm">
                  <p><span className="text-gray-500">Bank:</span> <span className="font-medium">{court?.venue.bankName || "BCA"}</span></p>
                  <p><span className="text-gray-500">No. Rekening:</span> <span className="font-mono font-bold text-lg">{court?.venue.bankAccount || "1234567890"}</span></p>
                  <p><span className="text-gray-500">Atas Nama:</span> <span className="font-medium">{court?.venue.bankHolder || "PadelBook"}</span></p>
                  <p><span className="text-gray-500">Jumlah:</span> <span className="font-bold text-brand-600">{formatRupiah(totalAmount)}</span></p>
                </div>
              </div>
              {/* Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2"><Upload className="w-4 h-4 inline mr-1" />Upload Bukti Transfer</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-brand-300 transition-colors cursor-pointer" onClick={() => document.getElementById("proof-upload")?.click()}>
                  <input id="proof-upload" type="file" accept="image/*" className="hidden" onChange={(e) => setTransferProof(e.target.files?.[0] || null)} />
                  {transferProof ? (
                    <div className="flex items-center justify-center gap-2"><CheckCircle2 className="w-5 h-5 text-brand-500" /><span className="text-sm font-medium text-gray-700">{transferProof.name}</span></div>
                  ) : (
                    <div><Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" /><p className="text-sm text-gray-500">Klik untuk upload bukti transfer</p><p className="text-xs text-gray-400 mt-1">Format: JPG, PNG, WebP (maks 5MB)</p></div>
                  )}
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-3.5 rounded-xl border border-gray-200 text-gray-600 font-medium hover:bg-gray-50 transition-colors">Kembali</button>
                <button
                  onClick={handleSubmitBooking}
                  disabled={submitting}
                  className="flex-1 py-3.5 rounded-xl gradient-brand text-white font-semibold flex items-center justify-center gap-2 shadow-md shadow-brand-500/25 disabled:opacity-50 transition-all"
                >
                  {submitting ? <><Loader2 className="w-4 h-4 animate-spin" />Memproses...</> : "Konfirmasi Booking"}
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {step === 4 && bookingResult && (
            <div className="text-center py-6 space-y-6">
              <div className="w-20 h-20 rounded-full gradient-brand flex items-center justify-center mx-auto shadow-lg shadow-brand-500/30">
                <CheckCircle2 className="w-10 h-10 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Booking Berhasil!</h3>
                <p className="text-gray-500">Simpan kode booking Anda untuk cek status</p>
              </div>
              <div className="bg-gray-50 rounded-2xl p-6 inline-block">
                <p className="text-xs text-gray-500 mb-1">Kode Booking</p>
                <p className="text-3xl font-mono font-bold text-brand-600 tracking-wider">{bookingResult.bookingCode}</p>
              </div>
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-800">
                Status: <span className="font-bold">PENDING</span> — Menunggu verifikasi dari operator
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="/" className="px-6 py-3 rounded-xl gradient-brand text-white font-semibold shadow-md">Kembali ke Beranda</a>
                <a href="/cek-booking" className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 transition-colors">Cek Status Booking</a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
