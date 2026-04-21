import { MembershipApplicationForm } from "@/components/membership-application-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getRenewalMembershipYear } from "@/lib/membership-year";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function RenewalContent() {
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/login");
  }

  const userId = data.claims.sub;

  const [{ data: profile }, { data: plans }, { data: latestMembership }] = await Promise.all([
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
    supabase
      .from("memberships")
      .select("plan_code,membership_year")
      .eq("primary_user_id", userId)
      .order("submitted_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const renewalYear = getRenewalMembershipYear(latestMembership?.membership_year);

  return (
    <div className="space-y-6">
      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader>
          <CardDescription>Renewal flow</CardDescription>
          <CardTitle>Start your next membership year</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Renewal year defaults to {renewalYear}. You can submit with your previous plan or choose a different plan.
        </CardContent>
      </Card>

      <MembershipApplicationForm
        initialProfile={profile ?? null}
        plans={plans ?? []}
        currentMembershipYear={renewalYear}
        initialPlanCode={latestMembership?.plan_code ?? undefined}
        mode="renewal"
      />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading renewal form...</div>}>
      <RenewalContent />
    </Suspense>
  );
}
