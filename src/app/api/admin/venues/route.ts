import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { venues } from "@/lib/db/schema";
import { sql } from "drizzle-orm";
import { slugify } from "@/lib/utils";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const allVenues = await db.select().from(venues).orderBy(sql`${venues.createdAt} DESC`);
    return NextResponse.json(allVenues);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch venues" }, { status: 500 });
  }
}

const venueSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  bankHolder: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = venueSchema.parse(body);

    const [newVenue] = await db
      .insert(venues)
      .values({
        name: data.name,
        slug: data.slug || slugify(data.name),
        address: data.address || null,
        description: data.description || null,
        phone: data.phone || null,
        bankName: data.bankName || null,
        bankAccount: data.bankAccount || null,
        bankHolder: data.bankHolder || null,
      })
      .returning();

    return NextResponse.json(newVenue, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to create venue" }, { status: 500 });
  }
}
