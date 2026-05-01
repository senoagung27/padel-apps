import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const { data: updated, error } = await supabase
      .from("venues")
      .update({
        name: body.name,
        slug: body.slug,
        address: body.address || null,
        description: body.description || null,
        phone: body.phone || null,
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error || !updated) return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (body.bankName && body.bankAccount && body.bankHolder) {
      await supabase.from("bank_accounts").upsert({
        venue_id: params.id,
        bank_name: body.bankName,
        account_number: body.bankAccount,
        account_holder: body.bankHolder,
      }, { onConflict: "venue_id" });
    }

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createAdminClient();
    const { error } = await supabase.from("venues").delete().eq("id", params.id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
