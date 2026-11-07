import { createHmac, timingSafeEqual } from 'node:crypto';

export function hasValidHmac(payload: string | Uint8Array, supplied: string | undefined, secret: string | undefined): boolean {
  if (!secret || !supplied || !/^[a-f0-9]{64}$/i.test(supplied)) return false;
  const expected = createHmac('sha256', secret).update(payload).digest();
  const provided = Buffer.from(supplied, 'hex');
  return provided.length === expected.length && timingSafeEqual(provided, expected);
}

export function getUsagePeriodKey(kind: 'scan' | 'ai_question', date: Date, timezone: string): string {
  let parts: Intl.DateTimeFormatPart[];
  try {
    parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    }).formatToParts(date);
  } catch {
    parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Kolkata',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);
  }
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const day = `${values.year}-${values.month}-${values.day}`;
  return kind === 'scan' ? day.slice(0, 7) : day;
}

export function paymentExpiry(plan: 'pro_monthly' | 'pro_yearly', now: Date): string {
  const expires = new Date(now);
  const day = expires.getUTCDate();
  expires.setUTCDate(1);
  if (plan === 'pro_monthly') expires.setUTCMonth(expires.getUTCMonth() + 1);
  else expires.setUTCFullYear(expires.getUTCFullYear() + 1);
  const lastDay = new Date(Date.UTC(expires.getUTCFullYear(), expires.getUTCMonth() + 1, 0)).getUTCDate();
  expires.setUTCDate(Math.min(day, lastDay));
  return expires.toISOString();
}
