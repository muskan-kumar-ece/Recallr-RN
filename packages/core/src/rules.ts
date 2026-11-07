import { ReminderRepeat } from './types';

/**
 * Normalizes a phone number to its key: strips all non-digits and takes the last 10 digits.
 */
export function phoneKey(phone?: string | null): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

/**
 * Normalizes an email to its key: trims whitespace and lowercases.
 */
export function emailKey(email?: string | null): string {
  if (!email) return '';
  return email.trim().toLowerCase();
}

export interface MatchCandidate {
  name?: string | null;
  company?: string | null;
  phone?: string | null;
  email?: string | null;
}

/**
 * Duplicate detection matching algorithm:
 * A match is found when ANY is true:
 * 1. phone_key is equal and has at least 7 digits
 * 2. email_key is equal and not empty
 * 3. name equal (ignoring case) AND company equal (ignoring case), both non-empty
 * Same name alone is NOT a duplicate.
 */
export function isDuplicateMatch(
  candidate: MatchCandidate,
  existing: MatchCandidate
): boolean {
  // 1. Phone match
  const cPhone = phoneKey(candidate.phone);
  const ePhone = phoneKey(existing.phone);
  if (cPhone.length >= 7 && ePhone.length >= 7 && cPhone === ePhone) {
    return true;
  }

  // 2. Email match
  const cEmail = emailKey(candidate.email);
  const eEmail = emailKey(existing.email);
  if (cEmail !== '' && eEmail !== '' && cEmail === eEmail) {
    return true;
  }

  // 3. Name AND company match
  const cName = candidate.name?.trim().toLowerCase() ?? '';
  const eName = existing.name?.trim().toLowerCase() ?? '';
  const cComp = candidate.company?.trim().toLowerCase() ?? '';
  const eComp = existing.company?.trim().toLowerCase() ?? '';

  if (cName !== '' && eName !== '' && cName === eName && cComp !== '' && eComp !== '' && cComp === eComp) {
    return true;
  }

  return false;
}

export interface FollowUpCandidate {
  deleted_at?: string | null;
  last_contacted_at?: string | null;
  created_at: string;
  has_future_reminder?: boolean;
}

/**
 * Calculates whether a contact is due for follow-up ("Needs follow-up").
 * Conditions:
 * - not deleted
 * - nudges are enabled
 * - coalesce(last_contacted_at, created_at) is older than nudge_days
 * - no undone reminder linked to the contact in the future
 */
export function isFollowUpDue(
  contact: FollowUpCandidate,
  nudgeDays: number,
  now: Date = new Date(),
  nudgesEnabled = true
): boolean {
  if (!nudgesEnabled) return false;
  if (contact.deleted_at) return false;
  if (contact.has_future_reminder) return false;

  const baselineStr = contact.last_contacted_at || contact.created_at;
  const baseline = new Date(baselineStr);
  if (isNaN(baseline.getTime())) return false;

  const diffMs = now.getTime() - baseline.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  return diffDays >= nudgeDays;
}

/** Checks quiet hours using the user's wall-clock timezone. */
export function isInQuietHours(now: Date, start: string, end: string, timezone: string): boolean {
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(start) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(end)) return false;
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: timezone,
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(now);
    const hour = Number(parts.find((part) => part.type === 'hour')?.value);
    const minute = Number(parts.find((part) => part.type === 'minute')?.value);
    if (!Number.isFinite(hour) || !Number.isFinite(minute)) return false;
    const currentMinutes = hour * 60 + minute;
    const [startHourText = '0', startMinuteText = '0'] = start.split(':');
    const [endHourText = '0', endMinuteText = '0'] = end.split(':');
    const startHour = Number(startHourText);
    const startMinute = Number(startMinuteText);
    const endHour = Number(endHourText);
    const endMinute = Number(endMinuteText);
    const startMinutes = startHour * 60 + startMinute;
    const endMinutes = endHour * 60 + endMinute;
    return startMinutes <= endMinutes
      ? currentMinutes >= startMinutes && currentMinutes < endMinutes
      : currentMinutes >= startMinutes || currentMinutes < endMinutes;
  } catch {
    return false;
  }
}

/**
 * Advances a repeating reminder until the remind_at timestamp is in the future.
 * Returns null if repeat is 'none'.
 */
export function advanceReminder(
  remindAt: string | Date,
  repeat: ReminderRepeat,
  now: Date = new Date()
): string | null {
  if (repeat === 'none') return null;

  const current = new Date(remindAt);
  if (isNaN(current.getTime())) return null;

  const target = new Date(current);

  while (target.getTime() <= now.getTime()) {
    if (repeat === 'daily') {
      target.setDate(target.getDate() + 1);
    } else if (repeat === 'weekly') {
      target.setDate(target.getDate() + 7);
    } else if (repeat === 'monthly') {
      const originalDay = current.getDate();
      target.setMonth(target.getMonth() + 1);
      // Clamp to last day of target month if necessary
      const daysInMonth = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();
      target.setDate(Math.min(originalDay, daysInMonth));
    }
  }

  return target.toISOString();
}

/**
 * Snoozes a reminder by the specified number of minutes from now.
 */
export function snoozeReminder(
  snoozeMinutes: number,
  now: Date = new Date()
): string {
  const target = new Date(now.getTime() + snoozeMinutes * 60 * 1000);
  return target.toISOString();
}

/**
 * Builds a standard RFC 6350 vCard (v3.0) string for exporting contacts or digital cards.
 */
export function buildVCard(data: {
  name?: string | null;
  role?: string | null;
  company?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  about?: string | null;
}): string {
  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0'];

  const name = data.name?.trim() || 'Contact';
  lines.push(`FN:${name}`);

  // N:FamilyNames;GivenNames;AdditionalNames;HonorificPrefixes;HonorificSuffixes
  const parts = name.split(' ');
  if (parts.length > 1) {
    const lastName = parts.pop();
    const firstName = parts.join(' ');
    lines.push(`N:${lastName};${firstName};;;`);
  } else {
    lines.push(`N:${name};;;;`);
  }

  if (data.company) lines.push(`ORG:${data.company.trim()}`);
  if (data.role) lines.push(`TITLE:${data.role.trim()}`);
  if (data.phone) lines.push(`TEL;TYPE=CELL:${data.phone.trim()}`);
  if (data.email) lines.push(`EMAIL;TYPE=INTERNET:${data.email.trim()}`);
  if (data.website) lines.push(`URL:${data.website.trim()}`);
  if (data.address) lines.push(`ADR;TYPE=WORK:;;${data.address.trim()};;;;`);
  if (data.about) lines.push(`NOTE:${data.about.trim()}`);

  lines.push('END:VCARD');
  return lines.join('\r\n');
}

export interface PublicCardSource {
  slug: string;
  name?: string | null;
  role?: string | null;
  company?: string | null;
  tagline?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  address?: string | null;
  about?: string | null;
  accent_color?: string | null;
  photo_path?: string | null;
  logo_path?: string | null;
  socials?: Array<{ platform: string; url: string }>;
  visibility?: Partial<{ phone: boolean; email: boolean; address: boolean; socials: boolean }> | null;
  is_active: boolean;
}

/** Return only fields intended for the public card page. */
export function toPublicCard(source: PublicCardSource) {
  if (!source.is_active) return null;
  const visibility = source.visibility ?? {};
  return {
    slug: source.slug,
    name: source.name ?? null,
    role: source.role ?? null,
    company: source.company ?? null,
    tagline: source.tagline ?? null,
    website: source.website ?? null,
    about: source.about ?? null,
    accent_color: source.accent_color ?? null,
    photo_path: source.photo_path ?? null,
    logo_path: source.logo_path ?? null,
    phone: visibility.phone === true ? source.phone ?? null : null,
    email: visibility.email === true ? source.email ?? null : null,
    address: visibility.address === true ? source.address ?? null : null,
    socials: visibility.socials === true ? source.socials ?? [] : [],
  };
}
