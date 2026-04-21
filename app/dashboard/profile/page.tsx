import { ProfileForm } from "@/components/profile-form";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function ProfileContent() {
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/login");
  }

  const userId = data.claims.sub;

  const { data: profile } = await supabase
    .from("profiles")
    .select(
      "first_name,last_name,email,dob,phone,address_line1,address_line2,city,state,postal_code,occupation",
    )
    .eq("id", userId)
    .maybeSingle();

  return (
    <div className="mx-auto max-w-4xl">
      <ProfileForm userId={userId} initialProfile={profile ?? null} />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading profile...</div>}>
      <ProfileContent />
    </Suspense>
  );
}