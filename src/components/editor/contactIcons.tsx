import { Phone, Mail, Briefcase, Globe, Code2, MapPin, Link2, type LucideIcon } from "lucide-react";
import type { ContactType } from "../../types";

/**
 * Field-specific icon shown next to each contact row, in place of a generic
 * indicator. lucide-react doesn't ship brand logos (trademark reasons), so
 * linkedin/github use the closest generic stand-ins.
 */
export const CONTACT_ICONS: Record<ContactType, LucideIcon> = {
  phone: Phone,
  email: Mail,
  linkedin: Briefcase,
  website: Globe,
  github: Code2,
  location: MapPin,
  custom: Link2,
};
