import { createClient } from "@/lib/supabase/server";
import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const rawNextPath = requestUrl.searchParams.get("next") ?? "/dashboard";
  const nextPath = rawNextPath.startsWith("/") ? rawNextPath : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, request.url),
      );
    }

    return NextResponse.redirect(new URL(nextPath, request.url));
  }

  return NextResponse.redirect(
    new URL("/login?error=Unable to authenticate with Google", request.url),
  );
}