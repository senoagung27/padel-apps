import { BookingDetailClient } from "@/components/dashboard/booking-detail-client";

export default function SuperadminBookingDetailPage({ params }: { params: { id: string } }) {
  return (
    <BookingDetailClient detailUrl={`/api/admin/bookings/${params.id}`} />
  );
}
