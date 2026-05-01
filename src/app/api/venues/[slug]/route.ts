import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = await createClient();
    const { data: venue, error: venueError } = await supabase
      .from("venues")
      .select("*, bank_accounts(*), courts(*)")
      .eq("slug", params.slug)
      .eq("is_active", true)
      .single();

    if (venueError || !venue) {
      return NextResponse.json({ error: "Venue not found" }, { status: 404 });
    }

    return NextResponse.json(venue);
  } catch {
    return NextResponse.json({ error: "Failed to fetch venue" }, { status: 500 });
  }
}
