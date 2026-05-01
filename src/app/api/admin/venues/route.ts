import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { slugify } from "@/lib/utils";
import { z } from "zod";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("venues")
      .select("*, bank_accounts(*)")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Failed to fetch venues" }, { status: 500 });
  }
}

const venueSchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  address: z.string().optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  bankHolder: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = venueSchema.parse(body);
    const supabase = createAdminClient();

    const { data: newVenue, error: venueError } = await supabase
      .from("venues")
      .insert({
        name: data.name,
        slug: data.slug || slugify(data.name),
        address: data.address || null,
        description: data.description || null,
        phone: data.phone || null,
      })
      .select()
      .single();

    if (venueError) throw venueError;

    if (data.bankName && data.bankAccount && data.bankHolder) {
      await supabase.from("bank_accounts").insert({
        venue_id: newVenue.id,
        bank_name: data.bankName,
        account_number: data.bankAccount,
        account_holder: data.bankHolder,
      });
    }

    return NextResponse.json(newVenue, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: error.errors }, { status: 400 });
    return NextResponse.json({ error: "Failed to create venue" }, { status: 500 });
  }
}
