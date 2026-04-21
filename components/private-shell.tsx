import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogoutButton } from "@/components/logout-button";

export function PrivateShell({
  children,
  isOfficer,
}: {
  children: React.ReactNode;
  isOfficer: boolean;
}) {
  return (
    <main className="min-h-screen pbia-page-bg text-foreground">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-4 py-6 md:px-8">
        <header className="flex flex-col gap-4 rounded-3xl border border-border/80 bg-card/85 p-4 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              PBIA Membership Portal
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Palm Beach Indian Association
            </h1>
          </div>
          <nav className="flex flex-wrap items-center gap-2 text-sm">
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard">Dashboard</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/profile">Profile</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/dashboard/membership">Membership</Link>
            </Button>
            {isOfficer ? (
              <Button asChild variant="ghost" size="sm">
                <Link href="/admin">Admin</Link>
              </Button>
            ) : null}
            <LogoutButton />
          </nav>
        </header>

        <section className="flex-1 py-8 md:py-10">{children}</section>

        <footer className="pb-2 text-xs text-muted-foreground">
          Membership submission and manual payment confirmation for PBIA.
        </footer>
      </div>
    </main>
  );
}