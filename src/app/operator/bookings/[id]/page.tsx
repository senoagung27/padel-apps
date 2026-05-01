import { BookingDetailClient } from "@/components/dashboard/booking-detail-client";

export default function OperatorBookingDetailPage({ params }: { params: { id: string } }) {
  return (
    <BookingDetailClient
      detailUrl={`/api/operator/bookings/${params.id}`}
      statusPatchUrl={`/api/operator/bookings/${params.id}/status`}
    />
  );
}
