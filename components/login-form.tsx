"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState } from "react";

export function LoginForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    const supabase = createClient();
    const redirectTo = `${window.location.origin}/auth/callback?next=/dashboard`;
    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo,
        },
      });

      if (error) throw error;
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Sign in</CardTitle>
          <CardDescription>
            Continue with Google to access the PBIA dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button type="button" className="w-full" onClick={handleGoogleLogin} disabled={isLoading}>
              {isLoading ? "Starting sign in..." : "Continue with Google"}
            </Button>
            {error && <p className="text-sm text-red-500">{error}</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
