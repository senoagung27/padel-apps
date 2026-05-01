import { db } from "@/lib/db";
import { venues, courts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { notFound } from "next/navigation";
import { CourtCard } from "@/components/public/court-card";
import { MapPin, Phone, ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { Metadata } from "next";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const venue = await db.query.venues.findFirst({
    where: eq(venues.slug, params.slug),
  });
  if (!venue) return { title: "Venue Tidak Ditemukan" };
  return {
    title: `${venue.name} — PadelBook`,
    description: venue.description || `Pesan lapangan padel di ${venue.name}`,
  };
}

export const dynamic = "force-dynamic";

export default async function VenuePage({ params }: Props) {
  const venue = await db.query.venues.findFirst({
    where: and(eq(venues.slug, params.slug), eq(venues.isActive, true)),
  });
  if (!venue) notFound();

  const courtList = await db
    .select()
    .from(courts)
    .where(and(eq(courts.venueId, venue.id), eq(courts.isActive, true)))
    .orderBy(courts.name);

  return (
    <div className="min-h-screen">
      <section className="relative">
        <div className="h-64 bg-gradient-to-br from-brand-600 via-brand-500 to-emerald-400 relative overflow-hidden">
          {venue.imageUrl && (
            <img src={venue.imageUrl} alt={venue.name} className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-50" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex flex-col justify-end pb-8">
            <Link href="/" className="inline-flex items-center gap-1.5 text-white/80 hover:text-white text-sm mb-4 transition-colors">
              <ArrowLeft className="w-4 h-4" />Kembali
            </Link>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">{venue.name}</h1>
            <div className="flex flex-wrap items-center gap-4 text-white/80 text-sm">
              {venue.address && <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /><span>{venue.address}</span></div>}
              {venue.phone && <div className="flex items-center gap-1.5"><Phone className="w-4 h-4" /><span>{venue.phone}</span></div>}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {venue.description && (
          <div className="mb-10 max-w-3xl">
            <h2 className="text-lg font-bold text-gray-900 mb-2">Tentang Venue</h2>
            <p className="text-gray-600 leading-relaxed">{venue.description}</p>
          </div>
        )}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Pilih Court</h2>
          <span className="text-sm text-gray-500">{courtList.length} court tersedia</span>
        </div>
        {courtList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courtList.map((court, i) => (
              <div key={court.id} className="animate-fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                <CourtCard court={court} venueSlug={venue.slug} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-gray-50 rounded-2xl">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Belum ada court tersedia</h3>
            <p className="text-sm text-gray-500">Court akan segera ditambahkan.</p>
          </div>
        )}
      </section>
    </div>
  );
}
