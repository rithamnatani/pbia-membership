"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Membership = {
  id: string;
  membership_year: string;
  status: string;
  payment_status: string;
  payment_method: string;
  payment_reference: string | null;
  submitted_at: string | null;
  approved_at: string | null;
  profiles: { first_name: string | null; last_name: string | null; email: string }[] | null;
  membership_plans: { name: string; code: string }[] | null;
};

export function AdminReviewList({
  memberships,
  officerEmail,
}: {
  memberships: Membership[];
  officerEmail: string;
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const markPaid = async (membership: Membership) => {
    setBusyId(membership.id);
    setError(null);

    try {
      const supabase = createClient();
      const { error: paymentError } = await supabase.from("payment_records").insert({
        membership_id: membership.id,
        method: membership.payment_method,
        amount_cents: null,
        reference: membership.payment_reference ?? membership.id,
        notes: "Manual payment recorded during admin review.",
        received_by: officerEmail,
      });

      if (paymentError) {
        throw paymentError;
      }

      const { error: membershipError } = await supabase
        .from("memberships")
        .update({ payment_status: "paid" })
        .eq("id", membership.id);

      if (membershipError) {
        throw membershipError;
      }

      router.refresh();
    } catch (submissionError: unknown) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to mark payment as received.",
      );
    } finally {
      setBusyId(null);
    }
  };

  const activate = async (membership: Membership) => {
    setBusyId(membership.id);
    setError(null);

    try {
      const supabase = createClient();
      const { error: membershipError } = await supabase
        .from("memberships")
        .update({
          status: "active",
          payment_status: "paid",
          approved_at: new Date().toISOString(),
        })
        .eq("id", membership.id);

      if (membershipError) {
        throw membershipError;
      }

      router.refresh();
    } catch (submissionError: unknown) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Unable to activate membership.",
      );
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="space-y-4">
      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      <div className="grid gap-4">
        {memberships.map((membership) => (
          (() => {
            const profile = Array.isArray(membership.profiles)
              ? membership.profiles[0]
              : membership.profiles;
            const plan = Array.isArray(membership.membership_plans)
              ? membership.membership_plans[0]
              : membership.membership_plans;

            return (
          <Card key={membership.id} className="border-slate-200/80 bg-white/95 shadow-sm">
            <CardHeader>
              <CardTitle>
                {profile?.first_name ?? "Member"} {profile?.last_name ?? ""}
              </CardTitle>
              <CardDescription>
                {plan?.name ?? membership.payment_method} · {membership.membership_year}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <div className="grid gap-2 md:grid-cols-2">
                <Meta label="Member email" value={profile?.email ?? "Unknown"} />
                <Meta label="Status" value={`${membership.status} / ${membership.payment_status}`} />
                <Meta label="Payment method" value={membership.payment_method} />
                <Meta label="Reference" value={membership.payment_reference ?? membership.id} />
              </div>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => markPaid(membership)}
                  disabled={busyId === membership.id}
                >
                  Mark payment received
                </Button>
                <Button
                  type="button"
                  onClick={() => activate(membership)}
                  disabled={busyId === membership.id}
                >
                  Activate membership
                </Button>
              </div>
            </CardContent>
          </Card>
            );
          })()
        ))}
      </div>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-slate-50 px-4 py-3">
      <div className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</div>
      <div className="mt-1 text-slate-800">{value}</div>
    </div>
  );
}