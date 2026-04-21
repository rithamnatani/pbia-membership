import { LoginForm } from "@/components/login-form";

export default function Page() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(204,169,114,0.16),_transparent_28%),linear-gradient(180deg,_#fdfaf5_0%,_#fff_42%,_#f7f0e2_100%)] px-4 py-10 text-slate-900 md:px-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 lg:flex-row lg:items-center lg:justify-between">
        <section className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-amber-700">
            Join or renew
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            Sign in to submit or renew your PBIA membership.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-slate-600">
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