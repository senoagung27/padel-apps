import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = await createClient();
    const searchParams = request.nextUrl.searchParams;
    const date = searchParams.get("date") || new Date().toISOString().slice(0, 10);

    // Get configured time slots for this court
    const { data: configuredSlots } = await supabase
      .from("time_slots")
      .select("*")
      .eq("court_id", params.id)
      .order("start_time");

    // Get existing bookings for the date (pending|terpesan = taken)
    const { data: existingBookings } = await supabase
      .from("bookings")
      .select("start_time, end_time, status")
      .eq("court_id", params.id)
      .eq("booking_date", date)
      .in("status", ["pending", "terpesan"]);

    const bookedTimes = new Set<string>();
    (existingBookings || []).forEach((b) => {
      const startHour = parseInt(b.start_time.split(":")[0]);
      const endHour = parseInt(b.end_time.split(":")[0]);
      for (let h = startHour; h < endHour; h++) {
        bookedTimes.add(`${h.toString().padStart(2, "0")}:00`);
      }
    });

    let slots;
    if (configuredSlots && configuredSlots.length > 0) {
      slots = configuredSlots.map((s) => ({
        startTime: s.start_time,
        endTime: s.end_time,
        isAvailable: !bookedTimes.has(s.start_time),
        isActive: s.is_available,
      }));
    } else {
      slots = [];
      for (let h = 8; h < 22; h++) {
        const startTime = `${h.toString().padStart(2, "0")}:00`;
        slots.push({
          startTime,
          endTime: `${(h + 1).toString().padStart(2, "0")}:00`,
          isAvailable: !bookedTimes.has(startTime),
          isActive: true,
        });
      }
    }

    return NextResponse.json({ slots, date });
  } catch {
    return NextResponse.json({ error: "Failed to fetch availability" }, { status: 500 });
  }
}
