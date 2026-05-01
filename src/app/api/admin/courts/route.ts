import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const venueId = request.nextUrl.searchParams.get("venueId");
    const supabase = createAdminClient();

    let query = supabase.from("courts").select("*").order("name");
    if (venueId) query = query.eq("venue_id", venueId);

    const { data, error } = await query;
    if (error) throw error;
    return NextResponse.json(data);
  } catch {
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
    const supabase = createAdminClient();

    const { data: newCourt, error } = await supabase
      .from("courts")
      .insert({
        venue_id: data.venueId,
        name: data.name,
        description: data.description || null,
        price_per_hour: data.pricePerHour,
      })
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(newCourt, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to create court" }, { status: 500 });
  }
}
