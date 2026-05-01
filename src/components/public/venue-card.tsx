import Link from "next/link";
import { MapPin, ArrowRight } from "lucide-react";

interface VenueCardProps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  venue: Record<string, any>;
}

export function VenueCard({ venue }: VenueCardProps) {
  return (
    <Link
      href={`/venue/${venue.slug}`}
      className="group block rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-brand-200 transition-all duration-300 hover:-translate-y-1"
    >
      {/* Image */}
      <div className="relative h-48 bg-gradient-to-br from-brand-100 to-brand-200 overflow-hidden">
        {venue.image_url ? (
          <img
            src={venue.image_url}
            alt={venue.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl gradient-brand flex items-center justify-center shadow-lg">
              <span className="text-white text-2xl font-bold">
                {venue.name.charAt(0)}
              </span>
            </div>
          </div>
        )}
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Content */}
      <div className="p-5">
        <h3 className="text-lg font-bold text-gray-900 group-hover:text-brand-600 transition-colors mb-2">
          {venue.name}
        </h3>
        {venue.address && (
          <div className="flex items-start gap-1.5 text-sm text-gray-500 mb-3">
            <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
            <span className="line-clamp-2">{venue.address}</span>
          </div>
        )}
        {venue.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mb-4">
            {venue.description}
          </p>
        )}
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-brand-50 text-brand-700">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
            Tersedia
          </span>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 group-hover:gap-2 transition-all">
            Lihat Court
            <ArrowRight className="w-4 h-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}
