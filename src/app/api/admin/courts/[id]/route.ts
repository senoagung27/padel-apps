import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { courts } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const [updated] = await db.update(courts).set({
      name: body.name,
      description: body.description || null,
      pricePerHour: body.pricePerHour,
      isActive: body.isActive ?? true,
    }).where(eq(courts.id, params.id)).returning();

    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  try {
    await db.delete(courts).where(eq(courts.id, params.id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete" }, { status: 500 });
  }
}
