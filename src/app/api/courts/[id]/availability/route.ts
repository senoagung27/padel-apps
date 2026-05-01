import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings, timeSlots } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date") || new Date().toISOString().slice(0, 10);

    // Get configured time slots for this court
    const configuredSlots = await db
      .select()
      .from(timeSlots)
      .where(eq(timeSlots.courtId, params.id))
      .orderBy(timeSlots.startTime);

    // Get existing bookings for the date
    const existingBookings = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.courtId, params.id),
          eq(bookings.bookingDate, date),
          // Only consider pending and confirmed bookings as "taken"
        )
      );

    const bookedTimes = new Set<string>();
    existingBookings.forEach((b) => {
      if (b.status === "pending" || b.status === "confirmed") {
        // Mark all hours between start and end as booked
        const startHour = parseInt(b.startTime.split(":")[0]);
        const endHour = parseInt(b.endTime.split(":")[0]);
        for (let h = startHour; h < endHour; h++) {
          bookedTimes.add(`${h.toString().padStart(2, "0")}:00:00`);
        }
      }
    });

    // If no configured slots, use default 08:00-22:00
    let slots;
    if (configuredSlots.length > 0) {
      slots = configuredSlots.map((s) => ({
        startTime: s.startTime,
        endTime: s.endTime,
        isAvailable: !bookedTimes.has(s.startTime),
        isActive: s.isActive,
      }));
    } else {
      slots = [];
      for (let h = 8; h < 22; h++) {
        const startTime = `${h.toString().padStart(2, "0")}:00:00`;
        slots.push({
          startTime,
          endTime: `${(h + 1).toString().padStart(2, "0")}:00:00`,
          isAvailable: !bookedTimes.has(startTime),
          isActive: true,
        });
      }
    }

    return NextResponse.json({ slots, date });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
  }
}
