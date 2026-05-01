import Image from "next/image";
import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { formatRupiah } from "@/lib/utils";

export type LapanganCourtCardProps = {
  court: {
    id: string;
    name: string;
    description: string | null;
    price_per_hour: number;
  };
  venue: {
    slug: string;
    name: string;
    address: string | null;
    image_url: string | null;
  };
};

export function LapanganCourtCard({ court, venue }: LapanganCourtCardProps) {
  const hasImage = Boolean(venue.image_url?.trim());

  return (
    <article className="group flex flex-col h-full rounded-3xl bg-white shadow-[0_4px_24px_-4px_rgba(15,23,42,0.12)] ring-1 ring-gray-900/5 overflow-hidden transition-all duration-300 hover:shadow-[0_20px_40px_-12px_rgba(15,118,110,0.25)] hover:-translate-y-1 hover:ring-brand-200/60">
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-gray-900">
        {hasImage ? (
          <Image
            src={venue.image_url!}
            alt={`Foto venue ${venue.name}`}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.06]"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={false}
          />
        ) : (
          <div
            className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-brand-700"
            aria-hidden
          >
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-6xl font-black text-white/25 select-none">
                {venue.name.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent pointer-events-none" />

        <div className="absolute top-3 left-3 right-3 flex flex-wrap items-start justify-between gap-2">
          <Link
            href={`/venue/${venue.slug}`}
            className="inline-flex max-w-[85%] items-center rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-gray-900 shadow-md backdrop-blur-sm transition hover:bg-white hover:text-brand-700"
          >
            {venue.name}
          </Link>
          <span className="inline-flex items-center rounded-full bg-emerald-400/95 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide text-emerald-950 shadow">
            Aktif
          </span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 pt-10">
          <h2 className="text-lg sm:text-xl font-bold text-white drop-shadow-md line-clamp-2 leading-snug">
            {court.name}
          </h2>
          {venue.address && (
            <p className="mt-1.5 flex items-start gap-1 text-xs text-white/85 line-clamp-1">
              <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5 opacity-90" />
              <span>{venue.address}</span>
            </p>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-5 pt-4">
        {court.description ? (
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-4 flex-1">
            {court.description}
          </p>
        ) : (
          <p className="text-sm text-gray-400 italic mb-4 flex-1">Court padel siap booking.</p>
        )}

        <div className="mt-auto flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-t border-gray-100 pt-4">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-gray-400">Per jam</p>
            <p className="text-2xl font-extrabold tracking-tight text-gray-900 tabular-nums">
              {formatRupiah(Number(court.price_per_hour))}
            </p>
          </div>
          <Link
            href={`/booking/${court.id}`}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-600 to-emerald-600 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-brand-600/30 transition hover:shadow-xl hover:shadow-brand-600/40 hover:brightness-105 active:scale-[0.98] sm:shrink-0"
          >
            Booking
            <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </article>
  );
}
