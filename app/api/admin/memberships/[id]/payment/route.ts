import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Params = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: Params) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: isOfficer, error: officerError } = await supabase.rpc("is_officer");

  if (officerError || !isOfficer) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let payload: { reference?: string; notes?: string; markActive?: boolean };

  try {
    payload = await request.json();
  } catch {
    payload = {};
  }

  const { error: rpcError } = await supabase.rpc("admin_record_payment", {
    p_membership_id: id,
    p_reference: payload.reference || undefined,
    p_notes: payload.notes || undefined,
    p_mark_active: Boolean(payload.markActive),
  });

  if (rpcError) {
    return NextResponse.json({ error: rpcError.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
