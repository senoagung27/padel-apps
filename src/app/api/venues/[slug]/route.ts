import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { venues, courts } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const venue = await db.query.venues.findFirst({
      where: and(eq(venues.slug, params.slug), eq(venues.isActive, true)),
    });

    if (!venue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    const venueCourts = await db
      .select()
      .from(courts)
      .where(and(eq(courts.venueId, venue.id), eq(courts.isActive, true)))
      .orderBy(courts.name);

    return NextResponse.json({ ...venue, courts: venueCourts });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch venue" }, { status: 500 });
  }
}
