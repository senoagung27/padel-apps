import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";

/** Kartu pintasan ke `/lapangan` — dipakai di beranda bersama venue */
export function LapanganCtaCard() {
  return (
    <Link
      href="/lapangan"
      className="group block rounded-2xl overflow-hidden bg-white border-2 border-dashed border-brand-200 shadow-sm hover:shadow-xl hover:border-brand-400 hover:-translate-y-1 transition-all duration-300"
    >
      <div className="relative h-48 bg-gradient-to-br from-brand-500/10 via-emerald-500/10 to-brand-600/15 flex flex-col items-center justify-center gap-3 px-6">
        <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center shadow-lg shadow-brand-500/30 group-hover:scale-105 transition-transform">
          <Search className="w-8 h-8 text-white" strokeWidth={2.25} />
        </div>
        <p className="text-sm font-semibold text-brand-800 text-center">
          Cari di semua venue
        </p>
      </div>
      <div className="p-5 border-t border-brand-100/80 bg-white/90">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-600 transition-colors mb-2">
          Halaman Lapangan
        </h3>
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          Daftar court aktif dengan pencarian nama, venue, atau alamat — lalu booking langsung.
        </p>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800">
            Semua venue
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-brand-600 group-hover:gap-2 transition-all">
            Buka
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
