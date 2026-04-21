"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState } from "react";

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

export function ProfileForm({
  userId,
  initialProfile,
}: {
  userId: string;
  initialProfile: InitialProfileDraft | null;
}) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
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

  const updateField = (field: keyof ProfileDraft, value: string) => {
    setProfile((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setError(null);
    setMessage(null);

    try {
      const supabase = createClient();
      const { error: profileError } = await supabase.from("profiles").upsert({
        id: userId,
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
      });

      if (profileError) {
        throw profileError;
      }

      setMessage("Profile saved.");
      router.refresh();
    } catch (submissionError: unknown) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "An error occurred while saving your profile.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border-border/80 bg-card/90 shadow-sm">
      <CardHeader>
        <CardTitle>Primary member profile</CardTitle>
        <CardDescription>
          Keep your contact and mailing details current for PBIA records.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="First name">
              <Input value={profile.first_name} onChange={(event) => updateField("first_name", event.target.value)} />
            </Field>
            <Field label="Last name">
              <Input value={profile.last_name} onChange={(event) => updateField("last_name", event.target.value)} />
            </Field>
            <Field label="Email">
              <Input type="email" value={profile.email} onChange={(event) => updateField("email", event.target.value)} />
            </Field>
            <Field label="Date of birth">
              <Input type="date" value={profile.dob} onChange={(event) => updateField("dob", event.target.value)} />
            </Field>
            <Field label="Phone">
              <Input value={profile.phone} onChange={(event) => updateField("phone", event.target.value)} />
            </Field>
            <Field label="Occupation">
              <Input value={profile.occupation} onChange={(event) => updateField("occupation", event.target.value)} />
            </Field>
            <div className="md:col-span-2">
              <Field label="Address line 1">
                <Input value={profile.address_line1} onChange={(event) => updateField("address_line1", event.target.value)} />
              </Field>
            </div>
            <div className="md:col-span-2">
              <Field label="Address line 2">
                <Input value={profile.address_line2} onChange={(event) => updateField("address_line2", event.target.value)} />
              </Field>
            </div>
            <Field label="City">
              <Input value={profile.city} onChange={(event) => updateField("city", event.target.value)} />
            </Field>
            <Field label="State">
              <Input value={profile.state} onChange={(event) => updateField("state", event.target.value)} />
            </Field>
            <Field label="Postal code">
              <Input value={profile.postal_code} onChange={(event) => updateField("postal_code", event.target.value)} />
            </Field>
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

          <Button type="submit" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save profile"}
          </Button>
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