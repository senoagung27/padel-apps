import { HeroSection } from "@/components/public/hero-section";
import { LapanganCtaCard } from "@/components/public/lapangan-cta-card";
import { VenueCard } from "@/components/public/venue-card";
import { createServerClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "PadelBook — Booking Lapangan Padel Online",
  description:
    "Pesan lapangan padel secara online dengan mudah. Pilih venue, pilih court, dan booking sekarang!",
};

export const dynamic = "force-dynamic";

type VenueRow = {
  id: string;
  slug: string;
  name: string;
  address?: string | null;
  description?: string | null;
  image_url?: string | null;
};

/** Hanya venue yang punya booking aktif (terpesan + pending), diurutkan paling ramai dulu */
async function getPopularVenues(): Promise<{ venue: VenueRow; activeBookingCount: number }[]> {
  try {
    const supabase = await createServerClient();

    const { data: bookingRows, error: bErr } = await supabase
      .from("bookings")
      .select("venue_id")
      .in("status", ["terpesan", "pending"]);

    if (bErr) throw bErr;

    const countByVenue = new Map<string, number>();
    for (const row of bookingRows ?? []) {
      const vid = row.venue_id as string;
      if (!vid) continue;
      countByVenue.set(vid, (countByVenue.get(vid) ?? 0) + 1);
    }

    const popularIds = Array.from(countByVenue.entries())
      .filter(([, n]) => n >= 1)
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);

    if (popularIds.length === 0) return [];

    const { data: venues, error: vErr } = await supabase
      .from("venues")
      .select("*")
      .eq("is_active", true)
      .in("id", popularIds);

    if (vErr) throw vErr;

    const order = new Map(popularIds.map((id, i) => [id, i]));
    const list = (venues ?? []) as VenueRow[];
    list.sort((a, b) => (order.get(a.id) ?? 999) - (order.get(b.id) ?? 999));

    return list.map((venue) => ({
      venue,
      activeBookingCount: countByVenue.get(venue.id) ?? 0,
    }));
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const popularVenues = await getPopularVenues();

  return (
    <>
      <HeroSection />

      {/* Venues section */}
      <section id="venues" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-orange-50 text-orange-700 text-sm font-medium mb-4">
              Paling ramai
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Venue <span className="text-gradient">lagi ramai</span>
            </h2>
            <p className="text-gray-500 max-w-2xl mx-auto">
              Hanya venue yang punya booking aktif (pending atau terpesan).
              Urutan dari yang paling banyak booking. Gunakan kartu{" "}
              <span className="font-medium text-gray-700">Halaman Lapangan</span> di
              bawah untuk cari semua court.
            </p>
          </div>

          {/* Venue grid — hanya yang punya booking aktif */}
          {popularVenues.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {popularVenues.map(({ venue, activeBookingCount }, index) => (
                <div
                  key={venue.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <VenueCard venue={venue} activeBookingCount={activeBookingCount} />
                </div>
              ))}
              <div
                className="animate-fade-in"
                style={{ animationDelay: `${popularVenues.length * 100}ms` }}
              >
                <LapanganCtaCard />
              </div>
            </div>
          ) : (
            <div className="space-y-10">
              <div className="max-w-md mx-auto">
                <LapanganCtaCard />
              </div>
              <div className="text-center py-6">
                <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-10 h-10 text-gray-300"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Belum ada venue yang ramai
                </h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  Muncul di sini setelah ada booking pending atau terpesan. Gunakan kartu
                  di atas untuk jelajahi semua court.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="inline-block px-4 py-1.5 rounded-full bg-brand-50 text-brand-600 text-sm font-medium mb-4">
              Cara Booking
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-4">
              Mudah dan <span className="text-gradient">Cepat</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: "1",
                title: "Pilih Venue",
                desc: "Telusuri dan pilih lapangan padel yang tersedia",
                icon: "🏟️",
              },
              {
                step: "2",
                title: "Pilih Court & Waktu",
                desc: "Tentukan court dan slot waktu yang Anda inginkan",
                icon: "📅",
              },
              {
                step: "3",
                title: "Isi Data & Bayar",
                desc: "Lengkapi data diri dan transfer ke rekening venue",
                icon: "💳",
              },
              {
                step: "4",
                title: "Dapat Konfirmasi",
                desc: "Terima kode booking dan tunggu konfirmasi operator",
                icon: "✅",
              },
            ].map((item, index) => (
              <div
                key={item.step}
                className="relative text-center animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="w-16 h-16 rounded-2xl bg-white shadow-lg flex items-center justify-center text-3xl mx-auto mb-4">
                  {item.icon}
                </div>
                <div className="absolute top-8 left-1/2 w-full h-0.5 bg-brand-200 hidden md:block last:hidden" style={{ transform: "translateX(50%)" }} />
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
