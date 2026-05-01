/**
 * Dijadwalkan di vercel.json (sekali per hari di akun Hobby).
 * Untuk jadwal lebih sering (mis. tiap jam), pakai plan Pro di Vercel atau panggil endpoint ini dari scheduler eksternal.
 */
import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabase
      .from("bookings")
      .update({ status: "expired" })
      .eq("status", "pending")
      .lt("booking_date", today);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to expire bookings" }, { status: 500 });
  }
}
