import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { redirect, notFound } from "next/navigation";
import { Suspense } from "react";

async function MembershipDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("memberships")
    .select(
      "id,membership_year,status,payment_status,payment_method,payment_reference,submitted_at,approved_at,plan_code,profiles(first_name,last_name,email),household_members(first_name,last_name,relationship_to_primary,dob,email,phone),payment_records(method,amount_cents,reference,notes,received_by,received_at)",
    )
    .eq("id", id)
    .maybeSingle();

  if (!membership) {
    notFound();
  }

  const primaryProfile = Array.isArray(membership.profiles)
    ? membership.profiles[0]
    : membership.profiles;

  return (
    <div className="space-y-6">
      <Card className="border-border/80 bg-card/90 shadow-sm">
        <CardHeader>
          <CardDescription>{membership.plan_code} · {membership.membership_year}</CardDescription>
          <CardTitle>
            {membership.status} / {membership.payment_status}
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3 text-sm">
          <Meta label="Payment method" value={membership.payment_method} />
          <Meta label="Payment reference" value={membership.payment_reference ?? "None"} />
          <Meta label="Submitted at" value={membership.submitted_at ?? "Not submitted"} />
          <Meta label="Approved at" value={membership.approved_at ?? "Not approved yet"} />
          <Meta label="Primary member" value={`${primaryProfile?.first_name ?? ""} ${primaryProfile?.last_name ?? ""}`.trim() || primaryProfile?.email || "Unknown"} />
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle>Household members</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {membership.household_members?.length ? (
              membership.household_members.map((member) => (
                <div key={`${member.first_name}-${member.last_name}`} className="rounded-2xl bg-muted px-4 py-3">
                  {member.first_name} {member.last_name} · {member.relationship_to_primary}
                </div>
              ))
            ) : (
              <p>No additional household members were added.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader>
            <CardTitle>Payment records</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            {membership.payment_records?.length ? (
              membership.payment_records.map((record) => (
                <div key={record.reference} className="rounded-2xl bg-muted px-4 py-3">
                  <div>{record.method} · {record.reference}</div>
                  <div className="text-xs text-muted-foreground">Received by {record.received_by}</div>
                </div>
              ))
            ) : (
              <p>No payment record has been entered yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading membership...</div>}>
      <MembershipDetailContent params={params} />
    </Suspense>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted px-4 py-3">
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-foreground">{value}</div>
    </div>
  );
}