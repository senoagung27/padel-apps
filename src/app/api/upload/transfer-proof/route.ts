import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function POST(request: NextRequest) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY?.trim()) {
      return NextResponse.json(
        { error: "Upload is not configured (missing SUPABASE_SERVICE_ROLE_KEY)" },
        { status: 503 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Invalid file type. Only JPEG, PNG, and WebP allowed." }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large. Maximum 5MB." }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;

    const supabase = createAdminClient();
    const { error } = await supabase.storage
      .from("transfer-proofs")
      .upload(filename, buffer, { contentType: file.type });

    if (error) {
      console.error("[transfer-proof]", error);
      return NextResponse.json(
        { error: error.message || "Storage upload failed" },
        { status: 500 }
      );
    }

    const { data: { publicUrl } } = supabase.storage
      .from("transfer-proofs")
      .getPublicUrl(filename);

    return NextResponse.json({ url: publicUrl }, { status: 201 });
  } catch (e) {
    console.error("[transfer-proof]", e);
    const message = e instanceof Error ? e.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
