import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateBookingCode } from "@/lib/utils";
import { z } from "zod";

const bookingSchema = z.object({
  courtId: z.string().uuid(),
  venueId: z.string().uuid(),
  guestName: z.string().min(1, "Nama wajib diisi"),
  guestEmail: z.string().email("Email tidak valid"),
  guestPhone: z.string().min(8, "Nomor HP tidak valid"),
  bookingDate: z.string(),
  startTime: z.string(),
  endTime: z.string(),
  durationHours: z.number().min(1),
  totalAmount: z.number().min(0),
  transferProofUrl: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = bookingSchema.parse(body);
    const supabase = await createClient();
    const bookingCode = generateBookingCode();

    const { data: newBooking, error } = await supabase
      .from("bookings")
      .insert({
        booking_code: bookingCode,
        court_id: data.courtId,
        venue_id: data.venueId,
        guest_name: data.guestName,
        guest_email: data.guestEmail,
        guest_phone: data.guestPhone,
        booking_date: data.bookingDate,
        start_time: data.startTime,
        end_time: data.endTime,
        duration_hours: data.durationHours,
        total_amount: data.totalAmount,
        transfer_proof_url: data.transferProofUrl || null,
        status: "pending",
      })
      .select("id, booking_code")
      .single();

    if (error) throw error;

    return NextResponse.json(
      { bookingCode: newBooking.booking_code, id: newBooking.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
