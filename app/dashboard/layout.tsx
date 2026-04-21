import { createClient } from "@/lib/supabase/server";
import { PrivateShell } from "@/components/private-shell";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

async function DashboardContent({
  children,
}: {
  children: React.ReactNode;
}) {
  await connection();
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (!data?.claims) {
    redirect("/login");
  }

  const { data: officer } = await supabase.rpc("is_officer");

  return <PrivateShell isOfficer={Boolean(officer)}>{children}</PrivateShell>;
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="p-6 text-sm text-muted-foreground">Loading dashboard...</div>}>
      <DashboardContent>{children}</DashboardContent>
    </Suspense>
  );
}