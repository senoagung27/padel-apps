import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("venues")
      .select("*")
      .eq("is_active", true)
      .order("created_at");

    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch venues" }, { status: 500 });
  }
}
