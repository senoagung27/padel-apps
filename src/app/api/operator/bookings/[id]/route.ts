import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings, courts, venues } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const booking = await db.query.bookings.findFirst({
      where: eq(bookings.id, params.id),
    });

    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    const court = await db.query.courts.findFirst({ where: eq(courts.id, booking.courtId) });
    const venue = await db.query.venues.findFirst({ where: eq(venues.id, booking.venueId) });

    return NextResponse.json({
      ...booking,
      courtName: court?.name || "",
      venueName: venue?.name || "",
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch booking" }, { status: 500 });
  }
}
