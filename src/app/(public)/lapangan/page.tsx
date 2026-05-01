import { Suspense } from "react";
import type { Metadata } from "next";
import { createServerClient } from "@/lib/supabase/server";
import { LapanganCourtCard } from "@/components/public/lapangan-court-card";
import { LapanganSearchForm } from "@/components/public/lapangan-search-form";
import { MapPinned, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Lapangan — PadelBook",
  description: "Telusuri semua court padel aktif. Cari berdasarkan nama venue, court, atau lokasi.",
};

export const dynamic = "force-dynamic";

type VenueJoin = {
  id: string;
  name: string;
  slug: string;
  address: string | null;
  is_active: boolean | null;
  image_url: string | null;
};

type CourtWithVenue = {
  id: string;
  name: string;
  description: string | null;
  price_per_hour: number;
  venue_id: string;
  venues: VenueJoin | VenueJoin[] | null;
};

function normalizeVenue(row: CourtWithVenue): VenueJoin | null {
  const v = row.venues;
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

function matchesQuery(row: CourtWithVenue, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  const v = normalizeVenue(row);
  const hay = [
    row.name,
    row.description,
    v?.name,
    v?.slug,
    v?.address,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(needle);
}

async function getCourtsWithVenues(): Promise<CourtWithVenue[]> {
  try {
    const supabase = await createServerClient();
    const { data, error } = await supabase
      .from("courts")
      .select(
        "id, name, description, price_per_hour, venue_id, venues!inner(id, name, slug, address, is_active, image_url)"
      )
      .eq("is_active", true)
      .eq("venues.is_active", true)
      .order("name");

    if (error) throw error;
    return (data as CourtWithVenue[]) ?? [];
  } catch {
    return [];
  }
}

export default async function LapanganPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const rawQ = searchParams.q ?? "";
  const allRows = await getCourtsWithVenues();
  const filtered = rawQ.trim() ? allRows.filter((r) => matchesQuery(r, rawQ)) : allRows;

  return (
    <div className="min-h-screen bg-[#f4f7f5]">
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-600 to-emerald-700 text-white py-16 lg:py-20">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12]"
          aria-hidden
          style={{
            backgroundImage: `radial-gradient(circle at 20% 20%, white 0%, transparent 45%), radial-gradient(circle at 80% 0%, #34d399 0%, transparent 40%), radial-gradient(circle at 100% 60%, white 0%, transparent 35%)`,
          }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/12 border border-white/25 text-sm font-medium mb-5 backdrop-blur-sm">
            <MapPinned className="w-4 h-4 shrink-0" />
            Katalog lapangan
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-amber-200" />
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mb-4 max-w-3xl mx-auto leading-[1.15]">
            Temukan court padel dengan foto venue & harga jelas
          </h1>
          <p className="text-white/90 text-sm sm:text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            Cari nama venue, court, atau alamat. Setiap kartu menampilkan gambar venue (jika ada) agar lebih mudah memilih.
          </p>
          <div className="max-w-2xl mx-auto rounded-2xl bg-white/[0.14] p-2 sm:p-3 shadow-2xl shadow-black/20 ring-1 ring-white/25 backdrop-blur-md">
            <Suspense
              fallback={
                <div className="h-[56px] rounded-xl bg-white/10 animate-pulse" />
              }
            >
              <LapanganSearchForm defaultQuery={rawQ} />
            </Suspense>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-14">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Daftar court</h2>
            <p className="text-sm text-gray-600 mt-2">
              <span className="font-semibold text-gray-900 tabular-nums">{filtered.length}</span> court
              {rawQ.trim() ? ` cocok dengan “${rawQ.trim()}”` : " aktif di semua venue"}
            </p>
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-7 lg:gap-8">
            {filtered.map((row, i) => {
              const v = normalizeVenue(row);
              if (!v) return null;
              return (
                <div
                  key={row.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
                >
                  <LapanganCourtCard
                    court={{
                      id: row.id,
                      name: row.name,
                      description: row.description,
                      price_per_hour: Number(row.price_per_hour),
                    }}
                    venue={{
                      slug: v.slug,
                      name: v.name,
                      address: v.address,
                      image_url: v.image_url,
                    }}
                  />
                </div>
              );
            })}
          </div>
        ) : (
          <div className="relative overflow-hidden text-center py-16 sm:py-20 rounded-3xl border border-gray-200/80 bg-white shadow-sm">
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.06]"
              aria-hidden
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 0h80v80H0z' fill='%23059669'/%3E%3Cpath d='M40 40m-20 0a20 20 0 1 1 40 0a20 20 0 1 1-40 0' fill='none' stroke='%23fff' stroke-width='2'/%3E%3C/svg%3E")`,
                backgroundSize: "120px 120px",
              }}
            />
            <div className="relative mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-100 to-emerald-100 text-brand-700">
              <MapPinned className="w-8 h-8" />
            </div>
            <p className="text-gray-900 font-semibold text-lg mb-2">Tidak ada court yang cocok</p>
            <p className="text-sm text-gray-600 max-w-md mx-auto px-4">
              Ubah kata kunci atau{" "}
              <a href="/lapangan" className="text-brand-600 font-semibold hover:underline">
                hapus filter
              </a>{" "}
              untuk melihat semua lapangan.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
