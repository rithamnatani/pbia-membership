import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { getRenewalMembershipYear } from "@/lib/membership-year";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function DashboardContent() {
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/login");
  }

  const userId = data.claims.sub;

  const [{ data: profile }, { data: memberships }, { count }] = await Promise.all([
    supabase.from("profiles").select("first_name,last_name,email").eq("id", userId).maybeSingle(),
    supabase
      .from("memberships")
      .select("id,status,plan_code,membership_year,payment_status,submitted_at")
      .eq("primary_user_id", userId)
      .order("submitted_at", { ascending: false })
      .limit(1),
    supabase
      .from("memberships")
      .select("id", { count: "exact", head: true })
      .eq("primary_user_id", userId),
  ]);

  const latestMembership = memberships?.[0];
  const renewalYear = getRenewalMembershipYear(latestMembership?.membership_year);
  const displayName = [profile?.first_name, profile?.last_name].filter(Boolean).join(" ") || data.claims.email || "Member";

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <Card className="border-border/80 bg-card/90 shadow-sm lg:col-span-2">
        <CardHeader>
          <CardDescription>Welcome back</CardDescription>
          <CardTitle>{displayName}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Stat label="Memberships" value={String(count ?? 0)} />
          <Stat label="Latest status" value={latestMembership ? `${latestMembership.status} / ${latestMembership.payment_status}` : "No submission yet"} />
          <Stat label="Profile" value={profile ? "Started" : "Needs attention"} />
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-accent/55 shadow-sm">
        <CardHeader>
          <CardTitle>Next step</CardTitle>
          <CardDescription>
            Finish your profile, review prior memberships, or start renewal.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button asChild className="w-full">
            <Link href="/dashboard/profile">Update profile</Link>
          </Button>
          <Button asChild className="w-full" variant="outline">
            <Link href="/dashboard/membership/renew">Renew for {renewalYear}</Link>
          </Button>
          <Button asChild className="w-full" variant="outline">
            <Link href="/dashboard/membership/new">Start a fresh application</Link>
          </Button>
          <Button asChild className="w-full" variant="outline">
            <Link href="/dashboard/membership">View membership history</Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="border-border/80 bg-card/90 shadow-sm lg:col-span-3">
        <CardHeader>
          <CardTitle>Latest submission</CardTitle>
          <CardDescription>
            Track the current membership status and payment progress.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {latestMembership ? (
            <div className="grid gap-4 md:grid-cols-4">
              <MiniStat label="Plan" value={latestMembership.plan_code} />
              <MiniStat label="Year" value={latestMembership.membership_year} />
              <MiniStat label="Status" value={latestMembership.status} />
              <MiniStat label="Payment" value={latestMembership.payment_status} />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              No membership has been submitted yet. Start one when you are ready.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading dashboard...</div>}>
      <DashboardContent />
    </Suspense>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted px-4 py-4">
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-lg font-semibold text-foreground">{value}</div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-muted px-4 py-4">
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-2 font-medium text-foreground">{value}</div>
    </div>
  );
}