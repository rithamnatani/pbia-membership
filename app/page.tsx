import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { Suspense } from "react";

async function MembershipPlansList() {
  await connection();

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: plans } = await supabase
    .from("membership_plans")
    .select("code,name,max_additional_members,price_cents")
    .eq("is_active", true)
    .order("code");

  return (
    <ul className="space-y-3">
      {plans?.map((plan) => (
        <li key={plan.code}>
          <div className="font-medium">{plan.name}</div>
          <div className="text-sm text-muted-foreground">
            {plan.code} · up to {plan.max_additional_members} additional member
            {plan.max_additional_members === 1 ? "" : "s"}
            {plan.price_cents == null ? " · pricing TBD" : ` · $${(plan.price_cents / 100).toFixed(2)}`}
          </div>
        </li>
      ))}
    </ul>
  );
}

export default function Page() {
  return (
    <Suspense fallback={<p>Loading membership plans...</p>}>
      <MembershipPlansList />
    </Suspense>
  );
}
