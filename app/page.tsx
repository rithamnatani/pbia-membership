import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PbiaLogo } from "@/components/pbia-logo";

const highlights = [
  "Membership submission for new and renewing families",
  "Google sign-in authentication",
  "Manual payment confirmation through Zelle, check, or cash",
];

const steps = [
  "Visit the membership page and review the options.",
  "Sign in with Google.",
  "Complete your profile and submit the membership for review.",
  "An officer confirms payment and activates the membership.",
];

const mission =
  "To promote Indian cultural activities in South Florida and Palm Beach County.";

const programs =
  "PBIA celebrates Indian culture through programs such as India Day, a day-long event featuring music, food, and dance from across the Indian subcontinent, shared with residents of Palm Beach and neighboring counties.";
export default function Page() {
  return (
    <main className="min-h-screen pbia-page-bg px-4 py-10 text-foreground md:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10">
        <header className="flex flex-col gap-4 rounded-3xl border border-border/80 bg-card/85 p-4 shadow-sm backdrop-blur md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
              Palm Beach Indian Association
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight">
              Community membership made simple.
            </h1>
            <div>
              <PbiaLogo className="max-w-[300px]" priority />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/membership">Join / Renew</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/payment-instructions">Payment instructions</Link>
            </Button>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
          <div className="space-y-6">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
              Membership submission, not checkout
            </p>
            <h2 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
              The PBIA portal for joining, renewing, and keeping family records up to date.
            </h2>
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              Members sign in, complete their profile, choose Single, Couple, or Family, and submit payment details for an officer to review. The association still confirms payments manually, so this flow stays simple while the app gets the right records in place.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/membership">Explore membership options</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            </div>
          </div>

          <Card className="border-border/80 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle>What members do here</CardTitle>
              <CardDescription>
                The experience is tuned for a community association, not an ecommerce checkout.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              {highlights.map((highlight) => (
                <div key={highlight} className="rounded-2xl bg-muted px-4 py-3">
                  {highlight}
                </div>
              ))}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {steps.map((step, index) => (
            <Card key={step} className="border-border/80 bg-card/90 shadow-sm">
              <CardHeader>
                <CardDescription>Step {index + 1}</CardDescription>
                <CardTitle>{step}</CardTitle>
              </CardHeader>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="border-border/80 bg-card/90 shadow-sm lg:col-span-3">
            <CardHeader>
              <CardDescription>Mission and programs</CardDescription>
              <CardTitle>Indian culture, community, and continuity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{mission}</p>
              <p>{programs}</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/90 shadow-sm lg:col-span-2">
            <CardHeader>
              <CardTitle>Membership options</CardTitle>
              <CardDescription>
                Single, Couple, and Family memberships are available through the application flow.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-3">
              {[
                ["Single", "No additional household members"],
                ["Couple", "Exactly one extra member"],
                ["Family", "Up to six extra members"],
              ].map(([title, body]) => (
                <div key={title} className="rounded-2xl border border-border bg-muted p-4">
                  <div className="font-medium text-foreground">{title}</div>
                  <div className="mt-2 text-sm text-muted-foreground">{body}</div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-accent/55 shadow-sm">
            <CardHeader>
              <CardTitle>Payments</CardTitle>
              <CardDescription>
                Zelle, check, and cash are supported while the association confirms payment manually.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-foreground/85">
              <div>Zelle QR can be shown on the payment instructions page when the image is available.</div>
              <div>Check payments can include the member name and membership year.</div>
              <div>Cash payments are recorded by an officer after collection.</div>
              <Button asChild variant="outline" className="w-full">
                <Link href="/payment-instructions">View payment instructions</Link>
              </Button>
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
