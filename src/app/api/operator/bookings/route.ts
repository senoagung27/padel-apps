import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: operatorVenues } = await supabase
      .from("operator_venues")
      .select("venue_id")
      .eq("user_id", user.id);

    const venueIds = (operatorVenues || []).map((ov) => ov.venue_id);

    if (venueIds.length === 0) return NextResponse.json([]);

    const { data, error } = await supabase
      .from("bookings")
      .select("*, courts(name), venues(name)")
      .in("venue_id", venueIds)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch bookings" }, { status: 500 });
  }
}
