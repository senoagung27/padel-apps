import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { formatRupiah } from "@/lib/utils";
import type { Court } from "@/lib/db/schema";

interface CourtCardProps {
  court: Court;
  venueSlug: string;
}

export function CourtCard({ court, venueSlug }: CourtCardProps) {
  return (
    <div className="group rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-sm hover:shadow-lg hover:border-brand-200 transition-all duration-300">
      {/* Header gradient */}
      <div className="h-3 gradient-brand" />

      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{court.name}</h3>
            {court.description && (
              <p className="text-sm text-gray-500 mt-1">{court.description}</p>
            )}
          </div>
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />
            <span className="text-xs font-medium text-brand-700">Aktif</span>
          </div>
        </div>

        <div className="flex items-end justify-between mt-4">
          <div>
            <p className="text-xs text-gray-500 mb-0.5">Harga per jam</p>
            <p className="text-xl font-bold text-gray-900">
              {formatRupiah(court.pricePerHour)}
            </p>
          </div>
          <Link
            href={`/booking/${court.id}`}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl gradient-brand text-white text-sm font-semibold shadow-md shadow-brand-500/25 hover:shadow-lg hover:shadow-brand-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
          >
            Booking
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
