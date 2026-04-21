import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <main className="min-h-screen pbia-page-bg px-4 py-10 text-foreground md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <section className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">
            Join or renew
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Sign in to submit or renew your PBIA membership.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
            Continue with Google or request a magic link. After sign-in, you can
            complete your profile, choose a membership plan, and submit payment
            details for manual review.
          </p>
        </section>

        <div className="w-full max-w-md">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}