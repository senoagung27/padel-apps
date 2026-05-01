import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    const { data: court, error: courtError } = await supabase
      .from("courts")
      .select("id, name, venue_id, price_per_hour")
      .eq("id", params.id)
      .single();

    if (courtError || !court) {
      return NextResponse.json({ error: "Court not found" }, { status: 404 });
    }

    const { data: venue } = await supabase
      .from("venues")
      .select("id, name, slug")
      .eq("id", court.venue_id)
      .single();

    const { data: bank } = await supabase
      .from("bank_accounts")
      .select("bank_name, account_number, account_holder")
      .eq("venue_id", court.venue_id)
      .limit(1)
      .maybeSingle();

    return NextResponse.json({
      id: court.id,
      name: court.name,
      pricePerHour: Number(court.price_per_hour || 0),
      venue: venue ? {
        id: venue.id,
        name: venue.name,
        slug: venue.slug,
        bankName: bank?.bank_name ?? null,
        bankAccount: bank?.account_number ?? null,
        bankHolder: bank?.account_holder ?? null,
      } : null,
    });
  } catch {
    return NextResponse.json({ error: "Failed to fetch court" }, { status: 500 });
  }
}
