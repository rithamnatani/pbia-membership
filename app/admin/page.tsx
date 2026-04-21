import { createClient } from "@/lib/supabase/server";
import { connection } from "next/server";
import { AdminReviewList } from "@/components/admin-review-list";
import { Suspense } from "react";

async function AdminContent() {
  await connection();
  const supabase = await createClient();

  const { data: memberships } = await supabase
    .from("memberships")
    .select("id,membership_year,status,payment_status,payment_method,payment_reference,submitted_at,approved_at,profiles(first_name,last_name,email),membership_plans(name,code)")
    .order("submitted_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-border/80 bg-card/90 p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
          Officer review
        </p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">
          Review membership submissions and record manual payments.
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          This page is visible only to officers listed in the access table.
        </p>
      </div>

      <AdminReviewList memberships={memberships ?? []} />
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="rounded-3xl border border-border/80 bg-card/90 p-6 text-muted-foreground shadow-sm">
          Loading admin review...
        </div>
      }
    >
      <AdminContent />
    </Suspense>
  );
}