import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const membershipOptions = [
  {
    code: "single",
    name: "Single",
    description: "One primary member, no additional household members.",
    extraMembers: "0 extra members",
  },
  {
    code: "couple",
    name: "Couple",
    description: "Primary member plus exactly one additional household member.",
    extraMembers: "1 extra member",
  },
  {
    code: "family",
    name: "Family",
    description: "Primary member plus up to six additional household members.",
    extraMembers: "Up to 6 extra members",
  },
];

const paymentMethods = [
  "Zelle",
  "Check",
  "Cash",
];

export default function Page() {
  return (
    <main className="min-h-screen pbia-page-bg px-4 py-10 text-foreground md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-5">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
              Membership landing page
            </p>
            <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              Choose the right membership for your household and submit it for manual payment review.
            </h1>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              This portal collects the primary profile, household details, and offline payment method so an officer can confirm the membership and mark it active.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/login">Join / Renew</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </div>

          <Card className="border-border/80 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle>Offline payment methods</CardTitle>
              <CardDescription>
                No Stripe yet. Memberships are submitted first, then confirmed manually.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {paymentMethods.map((method) => (
                <div key={method} className="rounded-2xl bg-muted px-4 py-3">
                  {method}
                </div>
              ))}
              <div className="rounded-2xl border-2 border-dashed border-primary/45 bg-accent/55 p-4 text-center text-muted-foreground">
                Zelle QR code placeholder
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 md:grid-cols-3">
          {membershipOptions.map((option) => (
            <Card key={option.code} className="border-border/80 bg-card/90 shadow-sm">
              <CardHeader>
                <CardDescription>{option.extraMembers}</CardDescription>
                <CardTitle>{option.name}</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground">
                <p>{option.description}</p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-border/80 bg-accent/55 shadow-sm">
            <CardHeader>
              <CardTitle>How the process works</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-foreground/85">
              <div>1. Sign in with Google or a magic link.</div>
              <div>2. Fill out the primary member profile.</div>
              <div>3. Select Single, Couple, or Family.</div>
              <div>4. Choose Zelle, Check, or Cash and submit the membership.</div>
              <div>5. An officer confirms the payment and activates the membership.</div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle>Ready to continue?</CardTitle>
              <CardDescription>
                Sign in first, then complete the application inside the dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild className="w-full" variant="outline">
                <Link href="/dashboard/membership/new">Start application</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}