import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Page() {
  return (
    <main className="min-h-screen pbia-page-bg px-4 py-10 text-foreground md:px-8">
      <div className="mx-auto max-w-4xl">
        <Card className="border-border/80 bg-card/90 shadow-sm">
          <CardHeader>
            <CardDescription>Programs and events</CardDescription>
            <CardTitle className="text-3xl">Event management is coming soon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-muted-foreground">
            <p>
              PBIA will use this area for community programs such as India Day and other cultural celebrations in Palm Beach County.
            </p>
            <p>
              For this MVP, membership registration and manual payment confirmation are prioritized first.
            </p>
            <Button asChild variant="outline">
              <Link href="/membership">Go to membership</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
