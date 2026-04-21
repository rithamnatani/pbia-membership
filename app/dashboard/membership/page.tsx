import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { redirect } from "next/navigation";
import { Suspense } from "react";

async function MembershipListContent() {
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/login");
  }

  const userId = data.claims.sub;

  const { data: memberships } = await supabase
    .from("memberships")
    .select("id,membership_year,status,payment_status,payment_method,submitted_at,approved_at,plan_code")
    .eq("primary_user_id", userId)
    .order("submitted_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200/80 bg-white/90 p-6 shadow-sm md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-amber-700">
            Dashboard membership
          </p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight">
            Your membership submissions
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Review the latest membership request, status, and payment method here.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/membership/new">New membership</Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {memberships?.length ? (
          memberships.map((membership) => (
            <Card key={membership.id} className="border-slate-200/80 bg-white/90 shadow-sm">
              <CardHeader>
                <CardDescription>
                  {membership.plan_code} · {membership.membership_year}
                </CardDescription>
                <CardTitle>
                  {membership.status} / {membership.payment_status}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-4">
                <div className="text-sm text-slate-600">
                  Payment method: {membership.payment_method}
                </div>
                <Button asChild variant="outline">
                  <Link href={`/dashboard/membership/${membership.id}`}>View details</Link>
                </Button>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card className="border-slate-200/80 bg-white/90 shadow-sm">
            <CardHeader>
              <CardTitle>No membership submissions yet</CardTitle>
              <CardDescription>
                Start a new membership submission when you are ready.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link href="/dashboard/membership/new">Start membership</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-slate-600">Loading memberships...</div>}>
      <MembershipListContent />
    </Suspense>
  );
}