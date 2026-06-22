import type { ContactType } from "../types";

/** US-style phone formatting: 3174522849 -> (317)-452-2849 */
export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)})-${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
  if (digits.length === 11 && digits[0] === "1") {
    return `+1 (${digits.slice(1, 4)})-${digits.slice(4, 7)}-${digits.slice(7)}`;
  }
  return value.trim();
}

/** Normalize a URL-ish value: strip protocol/www and trailing slash. */
function stripUrl(value: string): string {
  return value
    .trim()
    .replace(/^https?:\/\//i, "")
    .replace(/^www\./i, "")
    .replace(/\/+$/, "");
}

export function formatLinkedIn(value: string): string {
  const s = stripUrl(value);
  if (!s) return s;
  if (/linkedin\.com/i.test(s)) return s;
  // A bare handle/username -> full profile path.
  return `linkedin.com/in/${s.replace(/^@/, "")}`;
}

export function formatGitHub(value: string): string {
  const s = stripUrl(value);
  if (!s) return s;
  if (/github\.com/i.test(s)) return s;
  return `github.com/${s.replace(/^@/, "")}`;
}

/** Title-case city, upper-case 2-letter state/country codes: "san francisco, ca" -> "San Francisco, CA" */
export function formatLocation(value: string): string {
  const titleCase = (w: string) =>
    w
      .split(/\s+/)
      .map((x) => (x ? x[0].toUpperCase() + x.slice(1).toLowerCase() : x))
      .join(" ");
  return value
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => (p.length === 2 ? p.toUpperCase() : titleCase(p)))
    .join(", ");
}

/** Apply the appropriate formatter for a contact field. Idempotent. */
export function formatContactValue(type: ContactType, value: string): string {
  switch (type) {
    case "phone":
      return formatPhone(value);
    case "linkedin":
      return formatLinkedIn(value);
    case "github":
      return formatGitHub(value);
    case "location":
      return formatLocation(value);
    case "website":
      return stripUrl(value);
    default:
      return value.trim();
  }
}
