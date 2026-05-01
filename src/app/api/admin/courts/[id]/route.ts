import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const { data: updated, error } = await supabase
      .from("courts")
      .update({
        name: body.name,
        description: body.description || null,
        price_per_hour: body.pricePerHour,
        is_active: body.isActive ?? true,
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error || !updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("courts").delete().eq("id", params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
