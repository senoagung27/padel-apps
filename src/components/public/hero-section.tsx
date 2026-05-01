import Link from "next/link";
import { ArrowRight, Calendar, Clock, Shield } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-hero opacity-95" />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.05%22%3E%3Cpath%20d%3D%22M36%2034v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6%2034v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6%204V0H4v4H0v2h4v4h2V6h4V4H6z%22%2F%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E')] opacity-30" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 text-white/90 text-sm mb-6 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse" />
            Booking online 24/7
          </div>

          {/* Heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white leading-tight mb-6 animate-fade-in">
            Pesan Lapangan
            <br />
            <span className="text-emerald-200">Padel</span> Sekarang
          </h1>

          {/* Subtitle */}
          <p className="text-lg sm:text-xl text-white/80 leading-relaxed mb-8 max-w-xl animate-fade-in animate-delay-100">
            Pilih lapangan favorit, tentukan waktu bermain, dan langsung booking. 
            Mudah, cepat, tanpa ribet!
          </p>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 animate-fade-in animate-delay-200">
            <Link
              href="/#venues"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white text-brand-700 font-semibold text-base shadow-xl shadow-black/10 hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              Pesan Sekarang
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/cek-booking"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-white/15 backdrop-blur-sm border border-white/30 text-white font-semibold text-base hover:bg-white/25 transition-all duration-200"
            >
              Cek Status Booking
            </Link>
          </div>
        </div>

        {/* Feature pills */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-16 animate-fade-in animate-delay-300">
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Pilih Jadwal</p>
              <p className="text-xs text-white/60">Lihat slot yang tersedia</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Booking Instan</p>
              <p className="text-xs text-white/60">Konfirmasi dalam hitungan menit</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-5 py-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/15">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Aman & Terpercaya</p>
              <p className="text-xs text-white/60">Data pemesan terlindungi</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 105C120 90 240 60 360 45C480 30 600 30 720 37.5C840 45 960 60 1080 67.5C1200 75 1320 75 1380 75L1440 75V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="white"
          />
        </svg>
      </div>
    </section>
  );
}
