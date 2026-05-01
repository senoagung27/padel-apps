import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
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
    const bookingCode = generateBookingCode();

    const [newBooking] = await db
      .insert(bookings)
      .values({
        bookingCode,
        courtId: data.courtId,
        venueId: data.venueId,
        guestName: data.guestName,
        guestEmail: data.guestEmail,
        guestPhone: data.guestPhone,
        bookingDate: data.bookingDate,
        startTime: data.startTime,
        endTime: data.endTime,
        durationHours: data.durationHours,
        totalAmount: data.totalAmount,
        transferProofUrl: data.transferProofUrl || null,
        status: "pending",
      })
      .returning();

    return NextResponse.json(
      { bookingCode: newBooking.bookingCode, id: newBooking.id },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to create booking" }, { status: 500 });
  }
}
