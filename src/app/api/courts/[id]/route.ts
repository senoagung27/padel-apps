import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { courts, venues } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const court = await db.query.courts.findFirst({
      where: eq(courts.id, params.id),
    });

    if (!court) {
      return NextResponse.json({ error: "Court not found" }, { status: 404 });
    }

    const venue = await db.query.venues.findFirst({
      where: eq(venues.id, court.venueId),
    });

    return NextResponse.json({
      ...court,
      venue: venue ? {
        id: venue.id,
        name: venue.name,
        slug: venue.slug,
        bankName: venue.bankName,
        bankAccount: venue.bankAccount,
        bankHolder: venue.bankHolder,
      } : null,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch court" }, { status: 500 });
  }
}
