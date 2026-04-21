import { createClient } from "@/lib/supabase/server";
import { PrivateShell } from "@/components/private-shell";
import { redirect } from "next/navigation";
import { connection } from "next/server";

export default async function DashboardLayout({
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