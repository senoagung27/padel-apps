import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { venues } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allVenues = await db
      .select()
      .from(venues)
      .where(eq(venues.isActive, true))
      .orderBy(venues.createdAt);
    return NextResponse.json(allVenues);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch venues" }, { status: 500 });
  }
}
