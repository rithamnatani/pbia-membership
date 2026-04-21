import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PbiaLogo } from "@/components/pbia-logo";
export default function Page() {
  const zelleQrPath = process.env.NEXT_PUBLIC_ZELLE_QR_PATH?.trim();

  return (
    <main className="min-h-screen pbia-page-bg px-4 py-10 text-foreground md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <header className="rounded-3xl border border-border/80 bg-card/90 p-5 shadow-sm md:p-7">
          <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr] md:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary">PBIA Payment Instructions</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">
                Submit membership first, then complete payment offline.
              </h1>
              <p className="mt-3 text-sm leading-6 text-muted-foreground md:text-base">
                The Palm Beach Indian Association confirms payments manually for this MVP. After you submit your membership application, use one of the methods below and include your name with the membership year.
              </p>
            </div>
            <PbiaLogo className="mx-auto max-w-sm" priority />
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-3">
          <Card className="border-border/80 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle>Zelle</CardTitle>
              <CardDescription>
                Fastest option for remote payment confirmation.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>
                Use the PBIA Zelle destination and add member full name plus membership year in the memo.
              </p>
              {zelleQrPath ? (
                <div className="overflow-hidden rounded-2xl border border-border bg-background p-2">
                  <Image
                    src={zelleQrPath}
                    alt="PBIA Zelle payment QR code"
                    width={600}
                    height={600}
                    className="h-auto w-full rounded-xl"
                  />
                </div>
              ) : (
                <div className="rounded-2xl border-2 border-dashed border-primary/45 bg-accent/50 p-4 text-center">
                  Add a QR image in public assets and set NEXT_PUBLIC_ZELLE_QR_PATH (example: /zelle-qr.png).
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle>Check</CardTitle>
              <CardDescription>
                Accepted for event-day or mailed payments.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Write the check to PBIA or the current association payee as communicated by officers.</p>
              <p>Include primary member name and membership year on the memo line.</p>
              <p>Hand it to a PBIA officer or mail it using the latest association mailing address.</p>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card/90 shadow-sm">
            <CardHeader>
              <CardTitle>Cash</CardTitle>
              <CardDescription>
                Collected in person by PBIA officers.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>Provide cash only to an authorized PBIA officer at a community event or designated meeting.</p>
              <p>Ask for a confirmation note or receipt reference for your records.</p>
              <p>Officers will record payment in the admin dashboard and activate your membership.</p>
            </CardContent>
          </Card>
        </section>

        <section className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href="/dashboard/membership/new">Start membership application</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/membership">Back to membership page</Link>
          </Button>
        </section>
      </div>
    </main>
  );
}
