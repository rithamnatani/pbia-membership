import { MembershipApplicationForm } from "@/components/membership-application-form";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

function getCurrentMembershipYear() {
  const year = new Date().getFullYear();
  return `${year}-${String((year + 1) % 100).padStart(2, "0")}`;
}

async function NewMembershipContent() {
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/login");
  }

  const userId = data.claims.sub;

  const [{ data: profile }, { data: plans }] = await Promise.all([
    supabase
      .from("profiles")
      .select(
        "first_name,last_name,email,dob,phone,address_line1,address_line2,city,state,postal_code,occupation",
      )
      .eq("id", userId)
      .maybeSingle(),
    supabase
      .from("membership_plans")
      .select("code,name,max_additional_members,price_cents")
      .eq("is_active", true)
      .order("code"),
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <MembershipApplicationForm
        initialProfile={profile ?? null}
        plans={plans ?? []}
        currentMembershipYear={getCurrentMembershipYear()}
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading membership form...</div>}>
      <NewMembershipContent />
    </Suspense>
  );
}