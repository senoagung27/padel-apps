import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings, courts, venues } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code");
    const email = searchParams.get("email");

    if (!code || !email) {
      return NextResponse.json({ error: "Code and email required" }, { status: 400 });
    }

    const booking = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.bookingCode, code),
        eq(bookings.guestEmail, email)
      ),
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const court = await db.query.courts.findFirst({
      where: eq(courts.id, booking.courtId),
    });
    const venue = await db.query.venues.findFirst({
      where: eq(venues.id, booking.venueId),
    });

    return NextResponse.json({
      bookingCode: booking.bookingCode,
      status: booking.status,
      guestName: booking.guestName,
      bookingDate: booking.bookingDate,
      startTime: booking.startTime,
      endTime: booking.endTime,
      durationHours: booking.durationHours,
      totalAmount: booking.totalAmount,
      courtName: court?.name || "",
      venueName: venue?.name || "",
      operatorNote: booking.operatorNote,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to check booking" }, { status: 500 });
  }
}
