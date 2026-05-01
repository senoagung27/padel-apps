import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const email = searchParams.get("email");

    if (!code || !email) {
      return NextResponse.json({ error: "Code and email required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data: booking, error } = await supabase
      .from("bookings")
      .select("*, courts(name), venues(name)")
      .eq("booking_code", code)
      .eq("guest_email", email)
      .single();

    if (error || !booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json({
      bookingCode: booking.booking_code,
      status: booking.status,
      guestName: booking.guest_name,
      bookingDate: booking.booking_date,
      startTime: booking.start_time,
      endTime: booking.end_time,
      durationHours: booking.duration_hours,
      totalAmount: booking.total_amount,
      courtName: booking.courts?.name || "",
      venueName: booking.venues?.name || "",
      operatorNote: booking.operator_note,
    });
  } catch {
    return NextResponse.json({ error: "Failed to check booking" }, { status: 500 });
  }
}
