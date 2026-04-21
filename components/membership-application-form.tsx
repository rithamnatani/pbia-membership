"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { Database } from "@/database.types";

type Plan = {
  code: Database["public"]["Enums"]["membership_plan_code"];
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

type InitialProfileDraft = {
  [K in keyof ProfileDraft]?: string | null;
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
  initialPlanCode,
  mode = "new",
}: {
  initialProfile: InitialProfileDraft | null;
  plans: Plan[];
  currentMembershipYear: string;
  initialPlanCode?: Plan["code"];
  mode?: "new" | "renewal";
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
  const initialSelectedPlan = plans.some((plan) => plan.code === initialPlanCode)
    ? initialPlanCode
    : plans[0]?.code;
  const [planCode, setPlanCode] = useState<Plan["code"]>(initialSelectedPlan ?? "single");
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
  const isCouplePlan = selectedPlan?.code === "couple";

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

  const validateSubmission = () => {
    const requiredProfileFields: Array<{ field: keyof ProfileDraft; label: string }> = [
      { field: "first_name", label: "First name" },
      { field: "last_name", label: "Last name" },
      { field: "email", label: "Email" },
      { field: "dob", label: "Date of birth" },
      { field: "phone", label: "Phone" },
      { field: "address_line1", label: "Address line 1" },
      { field: "city", label: "City" },
      { field: "state", label: "State" },
      { field: "postal_code", label: "Postal code" },
    ];

    for (const entry of requiredProfileFields) {
      if (!String(profile[entry.field] ?? "").trim()) {
        return `${entry.label} is required.`;
      }
    }

    const email = profile.email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Enter a valid primary member email address.";
    }

    if (!selectedPlan?.code) {
      return "No active membership plan is available. Please contact an officer.";
    }

    if (selectedPlan.code === "couple") {
      const member = visibleHouseholdMembers[0];
      if (!member) {
        return "Couple memberships require one additional member.";
      }

      if (!member.first_name.trim() || !member.last_name.trim() || !member.relationship_to_primary.trim() || !member.dob) {
        return "For Couple memberships, the additional member needs first name, last name, relationship, and date of birth.";
      }
    }

    if (selectedPlan.code === "family") {
      for (const [index, member] of visibleHouseholdMembers.entries()) {
        const hasAnyValue = Boolean(
          member.first_name.trim() ||
          member.last_name.trim() ||
          member.relationship_to_primary.trim() ||
          member.dob ||
          member.email.trim() ||
          member.phone.trim(),
        );

        if (hasAnyValue && (!member.first_name.trim() || !member.last_name.trim() || !member.relationship_to_primary.trim() || !member.dob)) {
          return `Extra member ${index + 1} needs first name, last name, relationship, and date of birth when partially filled.`;
        }

        if (member.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(member.email.trim())) {
          return `Extra member ${index + 1} has an invalid email address.`;
        }
      }
    }

    return null;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const validationError = validateSubmission();
    if (validationError) {
      setError(validationError);
      setIsSubmitting(false);
      return;
    }

    try {
      const supabase = createClient();

      const householdPayload = visibleHouseholdMembers
        .map((member) => ({
          first_name: member.first_name.trim(),
          last_name: member.last_name.trim(),
          relationship_to_primary: member.relationship_to_primary.trim(),
          dob: member.dob || null,
          email: member.email.trim() || null,
          phone: member.phone.trim() || null,
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
        if (householdPayload.length !== 1) {
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
          p_payment_reference: paymentReference || undefined,
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
        <CardTitle>{mode === "renewal" ? "Membership renewal" : "Membership submission"}</CardTitle>
        <CardDescription>
          Complete the primary profile, select a plan, and submit manual payment details for officer review.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-8" onSubmit={handleSubmit}>
          <section className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="First name" htmlFor="primary-first-name" required>
                <Input id="primary-first-name" required value={profile.first_name} onChange={(event) => updateProfile("first_name", event.target.value)} />
              </Field>
              <Field label="Last name" htmlFor="primary-last-name" required>
                <Input id="primary-last-name" required value={profile.last_name} onChange={(event) => updateProfile("last_name", event.target.value)} />
              </Field>
              <Field label="Email" htmlFor="primary-email" required>
                <Input id="primary-email" required type="email" value={profile.email} onChange={(event) => updateProfile("email", event.target.value)} />
              </Field>
              <Field label="Date of birth" htmlFor="primary-dob" required>
                <Input id="primary-dob" required type="date" value={profile.dob} onChange={(event) => updateProfile("dob", event.target.value)} />
              </Field>
              <Field label="Phone" htmlFor="primary-phone" required>
                <Input id="primary-phone" required value={profile.phone} onChange={(event) => updateProfile("phone", event.target.value)} />
              </Field>
              <Field label="Occupation (optional)" htmlFor="primary-occupation">
                <Input id="primary-occupation" value={profile.occupation} onChange={(event) => updateProfile("occupation", event.target.value)} />
              </Field>
              <div className="md:col-span-2">
                <Field label="Address line 1" htmlFor="primary-address-line1" required>
                  <Input id="primary-address-line1" required value={profile.address_line1} onChange={(event) => updateProfile("address_line1", event.target.value)} />
                </Field>
              </div>
              <div className="md:col-span-2">
                <Field label="Address line 2 (optional)" htmlFor="primary-address-line2">
                  <Input id="primary-address-line2" value={profile.address_line2} onChange={(event) => updateProfile("address_line2", event.target.value)} />
                </Field>
              </div>
              <Field label="City" htmlFor="primary-city" required>
                <Input id="primary-city" required value={profile.city} onChange={(event) => updateProfile("city", event.target.value)} />
              </Field>
              <Field label="State" htmlFor="primary-state" required>
                <Input id="primary-state" required value={profile.state} onChange={(event) => updateProfile("state", event.target.value)} />
              </Field>
              <Field label="Postal code" htmlFor="primary-postal-code" required>
                <Input id="primary-postal-code" required value={profile.postal_code} onChange={(event) => updateProfile("postal_code", event.target.value)} />
              </Field>
            </div>
          </section>

          <section className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Membership plan" htmlFor="membership-plan" required>
                <select
                  id="membership-plan"
                  required
                  className="h-10 rounded-md border border-input bg-background px-3 text-sm shadow-sm"
                  value={planCode}
                  onChange={(event) => setPlanCode(event.target.value as Plan["code"])}
                >
                  {plans.map((plan) => (
                    <option key={plan.code} value={plan.code}>
                      {plan.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Membership year" htmlFor="membership-year" required>
                <Input id="membership-year" value={currentMembershipYear} readOnly />
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
                        <Field label="First name" htmlFor={`extra-first-name-${index}`} required={isCouplePlan}>
                          <Input
                            id={`extra-first-name-${index}`}
                            required={isCouplePlan}
                            value={member.first_name}
                            onChange={(event) => updateHouseholdMember(index, "first_name", event.target.value)}
                          />
                        </Field>
                        <Field label="Last name" htmlFor={`extra-last-name-${index}`} required={isCouplePlan}>
                          <Input
                            id={`extra-last-name-${index}`}
                            required={isCouplePlan}
                            value={member.last_name}
                            onChange={(event) => updateHouseholdMember(index, "last_name", event.target.value)}
                          />
                        </Field>
                        <Field label="Relationship to primary" htmlFor={`extra-relationship-${index}`} required={isCouplePlan}>
                          <Input
                            id={`extra-relationship-${index}`}
                            required={isCouplePlan}
                            value={member.relationship_to_primary}
                            onChange={(event) => updateHouseholdMember(index, "relationship_to_primary", event.target.value)}
                          />
                        </Field>
                        <Field label="Date of birth" htmlFor={`extra-dob-${index}`} required={isCouplePlan}>
                          <Input
                            id={`extra-dob-${index}`}
                            required={isCouplePlan}
                            type="date"
                            value={member.dob}
                            onChange={(event) => updateHouseholdMember(index, "dob", event.target.value)}
                          />
                        </Field>
                        <Field label="Email" htmlFor={`extra-email-${index}`}>
                          <Input id={`extra-email-${index}`} type="email" value={member.email} onChange={(event) => updateHouseholdMember(index, "email", event.target.value)} />
                        </Field>
                        <Field label="Phone" htmlFor={`extra-phone-${index}`}>
                          <Input id={`extra-phone-${index}`} value={member.phone} onChange={(event) => updateHouseholdMember(index, "phone", event.target.value)} />
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
                      name="payment-method"
                      aria-label={`Pay with ${method.label}`}
                      className="ml-3"
                      checked={paymentMethod === method.value}
                      onChange={() => setPaymentMethod(method.value)}
                    />
                  </label>
                ))}
              </div>

              <Field label="Payment reference or memo" htmlFor="payment-reference">
                <Input
                  id="payment-reference"
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
                      Use the Zelle destination provided by the association.
                    </p>
                    <Button asChild variant="outline" className="w-full">
                      <Link href="/payment-instructions">Open Zelle, check, and cash instructions</Link>
                    </Button>
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

              {error ? (
                <p role="alert" className="text-sm text-red-600">{error}</p>
              ) : null}

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
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-2">
      <Label htmlFor={htmlFor}>
        {label}
        {required ? <span className="ml-1 text-primary">*</span> : null}
      </Label>
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