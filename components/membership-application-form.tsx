"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

type Plan = {
  code: "single" | "couple" | "family" | string;
  name: string;
  max_additional_members: number;
  price_cents: number | null;
};

type HouseholdDraft = {
  first_name: string;
  last_name: string;
  relationship_to_primary: string;
  dob: string;
  email: string;
  phone: string;
};

type ProfileDraft = {
  first_name: string;
  last_name: string;
  email: string;
  dob: string;
  phone: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  occupation: string;
};

const paymentMethods = [
  { value: "zelle", label: "Zelle" },
  { value: "check", label: "Check" },
  { value: "cash", label: "Cash" },
] as const;

function createEmptyHouseholdMember(): HouseholdDraft {
  return {
    first_name: "",
    last_name: "",
    relationship_to_primary: "",
    dob: "",
    email: "",
    phone: "",
  };
}

export function MembershipApplicationForm({
  initialProfile,
  plans,
  currentMembershipYear,
}: {
  initialProfile: Partial<ProfileDraft> | null;
  plans: Plan[];
  currentMembershipYear: string;
}) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<ProfileDraft>({
    first_name: initialProfile?.first_name ?? "",
    last_name: initialProfile?.last_name ?? "",
    email: initialProfile?.email ?? "",
    dob: initialProfile?.dob ?? "",
    phone: initialProfile?.phone ?? "",
    address_line1: initialProfile?.address_line1 ?? "",
    address_line2: initialProfile?.address_line2 ?? "",
    city: initialProfile?.city ?? "",
    state: initialProfile?.state ?? "",
    postal_code: initialProfile?.postal_code ?? "",
    occupation: initialProfile?.occupation ?? "",
  });
  const [planCode, setPlanCode] = useState<Plan["code"]>(plans[0]?.code ?? "single");
  const [paymentMethod, setPaymentMethod] = useState<(typeof paymentMethods)[number]["value"]>("zelle");
  const [paymentReference, setPaymentReference] = useState("");
  const [householdMembers, setHouseholdMembers] = useState<HouseholdDraft[]>(
    Array.from({ length: 6 }, createEmptyHouseholdMember),
  );

  const selectedPlan = useMemo(
    () => plans.find((plan) => plan.code === planCode) ?? plans[0],
    [plans, planCode],
  );
  const householdCount = selectedPlan?.max_additional_members ?? 0;
  const visibleHouseholdMembers = householdMembers.slice(0, householdCount);

  const updateProfile = (field: keyof ProfileDraft, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const updateHouseholdMember = (
    index: number,
    field: keyof HouseholdDraft,
    value: string,
  ) => {
    setHouseholdMembers((current) =>
      current.map((member, memberIndex) =>
        memberIndex === index ? { ...member, [field]: value } : member,
      ),
    );
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const supabase = createClient();

      const householdPayload = visibleHouseholdMembers
        .map((member) => ({
          first_name: member.first_name.trim(),
          last_name: member.last_name.trim(),
          relationship_to_primary: member.relationship_to_primary.trim(),
          dob: member.dob || null,
          email: member.email || null,
          phone: member.phone || null,
        }))
        .filter(
          (member) =>
            member.first_name ||
            member.last_name ||
            member.relationship_to_primary ||
            member.dob ||
            member.email ||
            member.phone,
        )
        .map((member) => ({
          ...member,
        }));

      if (selectedPlan.code === "couple") {
        const hasExtraMember = Boolean(
          householdPayload[0]?.first_name ||
            householdPayload[0]?.last_name ||
            householdPayload[0]?.relationship_to_primary,
        );

        if (!hasExtraMember) {
          throw new Error("Couple memberships require one additional member.");
        }
      }

      const { data, error: submissionError } = await supabase.rpc(
        "submit_membership_application",
        {
          p_profile: {
            first_name: profile.first_name || null,
            last_name: profile.last_name || null,
            email: profile.email,
            dob: profile.dob || null,
            phone: profile.phone || null,
            address_line1: profile.address_line1 || null,
            address_line2: profile.address_line2 || null,
            city: profile.city || null,
            state: profile.state || null,
            postal_code: profile.postal_code || null,
            occupation: profile.occupation || null,
          },
          p_plan_code: planCode,
          p_membership_year: currentMembershipYear,
          p_payment_method: paymentMethod,
          p_payment_reference: paymentReference || null,
          p_household_members: householdPayload,
        },
      );

      if (submissionError) {
        throw submissionError;
      }

      const membershipId = typeof data === "string" ? data : String(data ?? "");

      if (!membershipId) {
        throw new Error("Membership submission failed. Please try again.");
      }

      router.push(`/dashboard/membership/${membershipId}`);
      router.refresh();
    } catch (submissionError: unknown) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "An error occurred while submitting the membership.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border/80 bg-card/90 shadow-sm">
      <CardHeader>
        <CardTitle>Membership submission</CardTitle>
        <CardDescription>
          Complete the primary profile, select a plan, and submit manual payment
          details for officer review.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit}>
          <section className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="First name">
                <Input value={profile.first_name} onChange={(event) => updateProfile("first_name", event.target.value)} />
              </Field>
              <Field label="Last name">
                <Input value={profile.last_name} onChange={(event) => updateProfile("last_name", event.target.value)} />
              </Field>
              <Field label="Email">
                <Input type="email" value={profile.email} onChange={(event) => updateProfile("email", event.target.value)} />
              </Field>
              <Field label="Date of birth">
                <Input type="date" value={profile.dob} onChange={(event) => updateProfile("dob", event.target.value)} />
              </Field>
              <Field label="Phone">
                <Input value={profile.phone} onChange={(event) => updateProfile("phone", event.target.value)} />
              </Field>
              <Field label="Occupation">
                <Input value={profile.occupation} onChange={(event) => updateProfile("occupation", event.target.value)} />
              </Field>
              <div className="md:col-span-2">
                <Field label="Address line 1">
                  <Input value={profile.address_line1} onChange={(event) => updateProfile("address_line1", event.target.value)} />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Address line 2">
                  <Input value={profile.address_line2} onChange={(event) => updateProfile("address_line2", event.target.value)} />
                </Field>
              </div>
              <Field label="City">
                <Input value={profile.city} onChange={(event) => updateProfile("city", event.target.value)} />
              </Field>
              <Field label="State">
                <Input value={profile.state} onChange={(event) => updateProfile("state", event.target.value)} />
              </Field>
              <Field label="Postal code">
                <Input value={profile.postal_code} onChange={(event) => updateProfile("postal_code", event.target.value)} />
              </Field>
            </div>
          </section>

          <section className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Membership plan">
                <select
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                  value={planCode}
                  onChange={(event) => setPlanCode(event.target.value)}
                >
                  {plans.map((plan) => (
                    <option key={plan.code} value={plan.code}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Membership year">
                <Input value={currentMembershipYear} readOnly />
              </Field>
            </div>

            <div className="rounded-2xl border border-primary/40 bg-accent/55 p-4 text-sm text-foreground">
              {selectedPlan?.name ?? "Selected plan"} allows up to {householdCount} additional member
              {householdCount === 1 ? "" : "s"}.
              {selectedPlan?.code === "single" ? " No extra-member section appears for this plan." : ""}
            </div>

            {visibleHouseholdMembers.length > 0 ? (
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Additional household members
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Fill in the extra members for your selected plan.
                  </p>
                </div>
                <div className="space-y-4">
                  {visibleHouseholdMembers.map((member, index) => (
                    <div key={`${planCode}-${index}`} className="rounded-2xl border border-border bg-muted p-4">
                      <p className="mb-4 text-sm font-medium text-foreground/85">
                        Extra member {index + 1}
                      </p>
                      <div className="grid gap-4 md:grid-cols-2">
                        <Field label="First name">
                          <Input value={member.first_name} onChange={(event) => updateHouseholdMember(index, "first_name", event.target.value)} />
                        </Field>
                        <Field label="Last name">
                          <Input value={member.last_name} onChange={(event) => updateHouseholdMember(index, "last_name", event.target.value)} />
                        </Field>
                        <Field label="Relationship to primary">
                          <Input value={member.relationship_to_primary} onChange={(event) => updateHouseholdMember(index, "relationship_to_primary", event.target.value)} />
                        </Field>
                        <Field label="Date of birth">
                          <Input type="date" value={member.dob} onChange={(event) => updateHouseholdMember(index, "dob", event.target.value)} />
                        </Field>
                        <Field label="Email">
                          <Input type="email" value={member.email} onChange={(event) => updateHouseholdMember(index, "email", event.target.value)} />
                        </Field>
                        <Field label="Phone">
                          <Input value={member.phone} onChange={(event) => updateHouseholdMember(index, "phone", event.target.value)} />
                        </Field>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  Payment method
                </h3>
                <p className="text-sm text-muted-foreground">
                  This is a membership submission with offline/manual payment confirmation.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.value}
                    className={`flex cursor-pointer items-center justify-between rounded-2xl border px-4 py-3 text-sm transition ${
                      paymentMethod === method.value
                        ? "border-primary bg-accent/60 text-foreground"
                        : "border-border bg-card"
                    }`}
                  >
                    <span>{method.label}</span>
                    <input
                      type="radio"
                      className="ml-3"
                      checked={paymentMethod === method.value}
                      onChange={() => setPaymentMethod(method.value)}
                    />
                  </label>
                ))}
              </div>

              <Field label="Payment reference or memo">
                <Input
                  placeholder="Optional note for check number or Zelle memo"
                  value={paymentReference}
                  onChange={(event) => setPaymentReference(event.target.value)}
                />
              </Field>

              <div className="space-y-3 rounded-3xl border border-border bg-muted p-5">
                <p className="text-sm font-semibold text-foreground/85">Manual payment instructions</p>
                {paymentMethod === "zelle" ? (
                  <>
                    <p className="text-sm text-muted-foreground">
                      Use the Zelle destination provided by the association. A QR code image will be added here later.
                    </p>
                    <div className="flex min-h-40 items-center justify-center rounded-2xl border-2 border-dashed border-primary/45 bg-card text-center text-sm text-muted-foreground">
                      Zelle QR code placeholder
                    </div>
                  </>
                ) : paymentMethod === "check" ? (
                  <p className="text-sm text-muted-foreground">
                    Bring or mail the check to an officer. Include the member name and membership year on the memo line.
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Cash can be handed to a PBIA officer or collected at an event. Keep the receipt or officer note for your records.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-4 rounded-3xl border border-border bg-card p-5 shadow-sm">
              <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Submission summary
              </h3>
              <div className="space-y-3 text-sm text-muted-foreground">
                <SummaryRow label="Plan" value={selectedPlan?.name ?? planCode} />
                <SummaryRow label="Household members" value={`${householdCount} additional section${householdCount === 1 ? "" : "s"}`} />
                <SummaryRow label="Payment method" value={paymentMethods.find((method) => method.value === paymentMethod)?.label ?? paymentMethod} />
                <SummaryRow label="Status on submit" value="submitted / pending" />
              </div>

              {error ? <p className="text-sm text-red-600">{error}</p> : null}

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit membership"}
              </Button>
            </div>
          </section>
        </form>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl bg-muted px-4 py-3">
      <span className="font-medium text-muted-foreground">{label}</span>
      <span className="text-right text-foreground">{value}</span>
    </div>
  );
}