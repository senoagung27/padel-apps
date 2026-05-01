type CourtEmbed = {
  name?: string | null;
  venues?: { name?: string | null } | { name?: string | null }[] | null;
} | null;

export type BookingRow = {
  id: string;
  booking_code: string;
  status: string;
  guest_name: string;
  guest_email: string;
  guest_phone: string;
  booking_date: string;
  start_time: string;
  end_time: string;
  duration_hours: number | string | null;
  total_amount: number | string | null;
  transfer_proof_url: string | null;
  operator_note: string | null;
  created_at: string;
  courts?: CourtEmbed | CourtEmbed[] | null;
};

function first<T>(v: T | T[] | null | undefined): T | null {
  if (v == null) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}

/** Satu baris booking Supabase + embed court/venue → JSON untuk UI (camelCase) */
export function mapBookingDetailRow(row: BookingRow) {
  const court = first(row.courts);
  const venue = first(court?.venues ?? null);

  return {
    id: row.id,
    bookingCode: row.booking_code,
    status: row.status,
    guestName: row.guest_name,
    guestEmail: row.guest_email,
    guestPhone: row.guest_phone,
    bookingDate: row.booking_date,
    startTime: row.start_time ?? "",
    endTime: row.end_time ?? "",
    durationHours: Number(row.duration_hours) || 0,
    totalAmount: Number(row.total_amount) || 0,
    transferProofUrl: row.transfer_proof_url ?? null,
    operatorNote: row.operator_note ?? null,
    courtName: court?.name ?? "—",
    venueName: venue?.name ?? "—",
    createdAt: row.created_at,
  };
}

export type BookingDetailDto = ReturnType<typeof mapBookingDetailRow>;
