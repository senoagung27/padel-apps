import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

/** DB uses terpesan/ditolak; UI sends confirmed/rejected */
const updateSchema = z
  .object({
    status: z.enum(["terpesan", "ditolak", "confirmed", "rejected"]),
    operator_note: z.string().optional(),
    operatorNote: z.string().optional(),
  })
  .transform((body) => {
    const status: "terpesan" | "ditolak" =
      body.status === "confirmed" || body.status === "terpesan"
        ? "terpesan"
        : "ditolak";
    const raw = body.operator_note ?? body.operatorNote;
    const operator_note = raw === undefined || raw === "" ? null : raw;
    return { status, operator_note };
  });

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    console.log("[STATUS PATCH] body received:", JSON.stringify(body));
    const parsed = updateSchema.parse(body);

    // Verify the booking belongs to a venue this operator manages
    const { data: operatorVenues } = await supabase
      .from("operator_venues")
      .select("venue_id")
      .eq("user_id", user.id);

    const venueIds = (operatorVenues || []).map((ov) => ov.venue_id);
    if (venueIds.length === 0) {
      return NextResponse.json({ error: "No venue assigned to this operator" }, { status: 403 });
    }

    const { data: updated, error } = await supabase
      .from("bookings")
      .update({
        status: parsed.status,
        operator_note: parsed.operator_note,
        confirmed_at: parsed.status === "terpesan" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .in("venue_id", venueIds)
      .select()
      .single();

    if (error || !updated) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error("[STATUS PATCH] error:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: "Failed to update status" }, { status: 500 });
  }
}
