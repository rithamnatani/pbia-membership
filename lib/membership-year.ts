function formatMembershipYear(startYear: number) {
  return `${startYear}-${String((startYear + 1) % 100).padStart(2, "0")}`;
}

function parseStartYear(membershipYear: string | null | undefined) {
  if (!membershipYear) {
    return null;
  }

  const match = /^(\d{4})-\d{2}$/.exec(membershipYear.trim());
  return match ? Number(match[1]) : null;
}

export function getCurrentMembershipYear(now = new Date()) {
  return formatMembershipYear(now.getFullYear());
}

export function getRenewalMembershipYear(latestMembershipYear: string | null | undefined, now = new Date()) {
  const currentYear = now.getFullYear();
  const latestStartYear = parseStartYear(latestMembershipYear);

  if (latestStartYear && latestStartYear >= currentYear) {
    return formatMembershipYear(latestStartYear + 1);
  }

  return formatMembershipYear(currentYear);
}
