import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

type OperatorRow = {
  id: string;
  name: string | null;
  email: string;
  role: string;
};

export async function GET() {
  try {
    const supabase = createAdminClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, email, role")
      .eq("role", "operator")
      .order("name");

    if (!error) {
      return NextResponse.json(data);
    }

    // Backward-compatible fallback for environments where profiles.email is missing.
    if (error.code === "42703") {
      const { data: fallbackProfiles, error: fallbackError } = await supabase
        .from("profiles")
        .select("id, name, role")
        .eq("role", "operator")
        .order("name");

      if (fallbackError) {
        throw fallbackError;
      }

      const { data: usersData, error: usersError } = await supabase.auth.admin.listUsers();
      if (usersError) {
        throw usersError;
      }

      const emailById = new Map(usersData.users.map((user) => [user.id, user.email ?? ""]));

      const normalizedOperators: OperatorRow[] = (fallbackProfiles ?? []).map((operator) => ({
        id: operator.id,
        name: operator.name,
        role: operator.role,
        email: emailById.get(operator.id) ?? "",
      }));

      return NextResponse.json(normalizedOperators);
    }

    throw error;
  } catch (error) {
    console.error("GET /api/admin/operators failed:", error);
    return NextResponse.json({ error: "Failed to fetch operators" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createAdminClient();

    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: { name: body.name },
    });

    if (authError || !authData.user) throw authError;

    await supabase
      .from("profiles")
      .update({ role: "operator", name: body.name })
      .eq("id", authData.user.id);

    return NextResponse.json({ id: authData.user.id, name: body.name, email: body.email }, { status: 201 });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to create operator";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
