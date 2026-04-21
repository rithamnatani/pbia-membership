"use client";

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
  profiles:
    | { first_name: string | null; last_name: string | null; email: string }
    | { first_name: string | null; last_name: string | null; email: string }[]
    | null;
  membership_plans:
    | { name: string; code: string }
    | { name: string; code: string }[]
    | null;
};

export function AdminReviewList({
  memberships,
}: {
  memberships: Membership[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const callAdminPaymentApi = async (membership: Membership, markActive: boolean) => {
    const response = await fetch(`/api/admin/memberships/${membership.id}/payment`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        reference: membership.payment_reference ?? membership.id,
        notes: markActive
          ? "Membership activated by officer review."
          : "Manual payment recorded during admin review.",
        markActive,
      }),
    });

    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(data?.error || "Unable to process admin payment update.");
    }
  };

  const markPaid = async (membership: Membership) => {
    setBusyId(membership.id);
    setError(null);

    try {
      await callAdminPaymentApi(membership, false);

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
      await callAdminPaymentApi(membership, true);

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
          <Card key={membership.id} className="border-border/80 bg-card/95 shadow-sm">
            <CardHeader>
              <CardTitle>
                {profile?.first_name ?? "Member"} {profile?.last_name ?? ""}
              </CardTitle>
              <CardDescription>
                {plan?.name ?? membership.payment_method} · {membership.membership_year}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
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
    <div className="rounded-2xl bg-muted px-4 py-3">
      <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-foreground">{value}</div>
    </div>
  );
}