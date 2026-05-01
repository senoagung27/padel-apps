import Link from "next/link";

export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-brand flex items-center justify-center">
                <span className="text-white font-bold text-sm">P</span>
              </div>
              <span className="text-lg font-bold text-white">
                PadelBook
              </span>
            </div>
            <p className="text-sm leading-relaxed">
              Aplikasi pemesanan lapangan padel mudah dan cepat. Pilih lapangan,
              pilih waktu, dan mainkan!
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Navigasi
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-sm hover:text-brand-400 transition-colors"
                >
                  Beranda
                </Link>
              </li>
              <li>
                <Link
                  href="/#venues"
                  className="text-sm hover:text-brand-400 transition-colors"
                >
                  Lapangan
                </Link>
              </li>
              <li>
                <Link
                  href="/cek-booking"
                  className="text-sm hover:text-brand-400 transition-colors"
                >
                  Cek Status Booking
                </Link>
              </li>
            </ul>
          </div>

          {/* Info */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Informasi
            </h3>
            <ul className="space-y-2">
              <li className="text-sm">
                Booking lapangan padel secara online 24/7
              </li>
              <li className="text-sm">
                Pembayaran via transfer bank
              </li>
              <li className="text-sm">
                Konfirmasi instan setelah verifikasi
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs">
            &copy; {new Date().getFullYear()} PadelBook. All rights reserved.
          </p>
          <p className="text-xs">
            Made with 🏸 for padel enthusiasts
          </p>
        </div>
      </div>
    </footer>
  );
}
