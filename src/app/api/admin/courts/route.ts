import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { courts } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const venueId = request.nextUrl.searchParams.get("venueId");
    let allCourts;
    if (venueId) {
      allCourts = await db.select().from(courts).where(eq(courts.venueId, venueId)).orderBy(courts.name);
    } else {
      allCourts = await db.select().from(courts).orderBy(courts.name);
    }
    return NextResponse.json(allCourts);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch courts" }, { status: 500 });
  }
}

const courtSchema = z.object({
  venueId: z.string().uuid(),
  name: z.string().min(1),
  description: z.string().optional(),
  pricePerHour: z.number().min(0),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = courtSchema.parse(body);

    const [newCourt] = await db
      .insert(courts)
      .values({
        venueId: data.venueId,
        name: data.name,
        description: data.description || null,
        pricePerHour: data.pricePerHour,
      })
      .returning();

    return NextResponse.json(newCourt, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to create court" }, { status: 500 });
  }
}
