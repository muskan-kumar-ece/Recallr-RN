import { describe, it, expect } from 'vitest';
import {
  phoneKey,
  emailKey,
  isDuplicateMatch,
  isFollowUpDue,
  isInQuietHours,
  advanceReminder,
  snoozeReminder,
  buildVCard,
  PLANS,
  isFeatureAllowed,
  contactInputSchema,
  categoryInputSchema,
  noteInputSchema,
  toPublicCard,
  firebaseScanCardInputSchema,
} from './index';

describe('Firebase callable input validation', () => {
  it('accepts only a well-formed private card image path', () => {
    expect(firebaseScanCardInputSchema.safeParse({ storagePath: 'users/user_123/cards/scan-abc.jpg' }).success).toBe(true);
    expect(firebaseScanCardInputSchema.safeParse({ storagePath: 'users/other/photos/private.jpg' }).success).toBe(false);
    expect(firebaseScanCardInputSchema.safeParse({ storagePath: 'users/user_123/cards/../private.jpg' }).success).toBe(false);
  });
});

describe('Phone and Email Key normalization', () => {
  it('normalizes phone number to last 10 digits', () => {
    expect(phoneKey('+91 98765 43210')).toBe('9876543210');
    expect(phoneKey('9876543210')).toBe('9876543210');
    expect(phoneKey('09876543210')).toBe('9876543210');
    expect(phoneKey('12345')).toBe('12345');
    expect(phoneKey(null)).toBe('');
    expect(phoneKey(undefined)).toBe('');
  });

  it('normalizes email key to lowercase and trimmed', () => {
    expect(emailKey('  John.Doe@Example.COM  ')).toBe('john.doe@example.com');
    expect(emailKey(null)).toBe('');
  });
});

describe('Public card projection', () => {
  const card = {
    slug: 'sam-example', name: 'Sam Example', phone: '+911234567890', email: 'sam@example.com',
    address: 'Private address', website: 'https://example.com', about: 'Public bio', is_active: true,
    visibility: { phone: false, email: true, address: false, socials: false },
  };

  it('returns only explicitly visible contact fields', () => {
    const result = toPublicCard(card);
    expect(result?.phone).toBeNull();
    expect(result?.email).toBe('sam@example.com');
    expect(result?.address).toBeNull();
    expect(result?.socials).toEqual([]);
    expect(result).not.toHaveProperty('user_id');
  });

  it('does not return an inactive card', () => {
    expect(toPublicCard({ ...card, is_active: false })).toBeNull();
  });
});

describe('Duplicate Detection Algorithm', () => {
  it('detects match by phone_key with at least 7 digits', () => {
    expect(
      isDuplicateMatch(
        { phone: '+91 98765 43210', name: 'Ramesh' },
        { phone: '09876543210', name: 'Different Name' }
      )
    ).toBe(true);
  });

  it('does not match by phone if fewer than 7 digits', () => {
    expect(
      isDuplicateMatch(
        { phone: '123456', name: 'Ramesh' },
        { phone: '123456', name: 'Different Name' }
      )
    ).toBe(false);
  });

  it('detects match by email_key', () => {
    expect(
      isDuplicateMatch(
        { email: 'ramesh@plastics.com', name: 'Ramesh' },
        { email: 'RAMESH@plastics.COM', name: 'Another Ramesh' }
      )
    ).toBe(true);
  });

  it('detects match by Name AND Company (both equal, non-empty)', () => {
    expect(
      isDuplicateMatch(
        { name: 'Ramesh Kumar', company: 'Sri Plastics' },
        { name: 'ramesh kumar', company: 'SRI PLASTICS' }
      )
    ).toBe(true);
  });

  it('does NOT match on name alone', () => {
    expect(
      isDuplicateMatch(
        { name: 'Ramesh Kumar', company: 'Company A' },
        { name: 'Ramesh Kumar', company: 'Company B' }
      )
    ).toBe(false);

    expect(
      isDuplicateMatch(
        { name: 'Ramesh Kumar' },
        { name: 'Ramesh Kumar' }
      )
    ).toBe(false);
  });
});

describe('Follow-up Calculation', () => {
  it('returns true when baseline is older than nudgeDays', () => {
    const now = new Date('2026-11-05T12:00:00Z');
    const fortyDaysAgo = new Date('2026-09-26T12:00:00Z').toISOString();

    const contact = {
      created_at: fortyDaysAgo,
      last_contacted_at: fortyDaysAgo,
    };

    expect(isFollowUpDue(contact, 30, now)).toBe(true);
  });

  it('returns false when contact has future reminder or is deleted', () => {
    const now = new Date('2026-11-05T12:00:00Z');
    const fortyDaysAgo = new Date('2026-09-26T12:00:00Z').toISOString();

    expect(
      isFollowUpDue(
        { created_at: fortyDaysAgo, deleted_at: '2026-10-01T00:00:00Z' },
        30,
        now
      )
    ).toBe(false);

    expect(
      isFollowUpDue(
        { created_at: fortyDaysAgo, has_future_reminder: true },
        30,
        now
      )
    ).toBe(false);
  });
});

describe('Reminder repeat and snooze calculations', () => {
  it('advances daily reminder to next future date', () => {
    const now = new Date('2026-11-05T12:00:00Z');
    const past = new Date('2026-11-03T09:00:00Z');

    const next = advanceReminder(past, 'daily', now);
    expect(next).not.toBeNull();
    const nextDate = new Date(next!);
    expect(nextDate.getTime()).toBeGreaterThan(now.getTime());
    expect(nextDate.toISOString()).toBe('2026-11-06T09:00:00.000Z');
  });

  it('snoozes reminder from now', () => {
    const now = new Date('2026-11-05T10:00:00Z');
    const snoozed = snoozeReminder(60, now);
    expect(snoozed).toBe('2026-11-05T11:00:00.000Z');
  });
});

describe('Reminder quiet hours', () => {
  it('handles overnight boundaries in the configured timezone', () => {
    expect(isInQuietHours(new Date('2026-11-07T22:00:00Z'), '22:00', '07:00', 'UTC')).toBe(true);
    expect(isInQuietHours(new Date('2026-11-08T06:59:00Z'), '22:00', '07:00', 'UTC')).toBe(true);
    expect(isInQuietHours(new Date('2026-11-08T07:00:00Z'), '22:00', '07:00', 'UTC')).toBe(false);
  });

  it('rejects invalid settings and uses the timezone wall clock', () => {
    expect(isInQuietHours(new Date('2026-11-08T07:00:00Z'), '22:00', '07:00', 'America/Los_Angeles')).toBe(true);
    expect(isInQuietHours(new Date('2026-11-08T01:00:00Z'), 'bad', '07:00', 'UTC')).toBe(false);
  });
});

describe('vCard generation', () => {
  it('builds valid vCard RFC 6350', () => {
    const vcard = buildVCard({
      name: 'Ramesh Kumar',
      company: 'Sri Plastics',
      role: 'Owner',
      phone: '+91 98765 43210',
      email: 'ramesh@sriplastics.in',
    });

    expect(vcard).toContain('BEGIN:VCARD');
    expect(vcard).toContain('VERSION:3.0');
    expect(vcard).toContain('FN:Ramesh Kumar');
    expect(vcard).toContain('ORG:Sri Plastics');
    expect(vcard).toContain('TEL;TYPE=CELL:+91 98765 43210');
    expect(vcard).toContain('END:VCARD');
  });
});

describe('Plans and Quotas', () => {
  it('enforces free vs pro quotas', () => {
    expect(PLANS.free.contacts).toBe(50);
    expect(PLANS.free.scansPerMonth).toBe(10);
    expect(PLANS.free.aiQuestionsPerDay).toBe(5);
    expect(PLANS.pro.contacts).toBe(Infinity);

    expect(isFeatureAllowed('free', 'contacts', 49)).toBe(true);
    expect(isFeatureAllowed('free', 'contacts', 50)).toBe(false);
    expect(isFeatureAllowed('pro', 'contacts', 500)).toBe(true);
  });
});

describe('Validation Schemas', () => {
  it('validates contact input', () => {
    const valid = contactInputSchema.safeParse({
      name: 'Mukesh Singh',
      phone: '9876511122',
      email: 'mukesh@tea.com',
    });
    expect(valid.success).toBe(true);

    const invalid = contactInputSchema.safeParse({
      name: '',
    });
    expect(invalid.success).toBe(false);
  });

  it('validates category input', () => {
    const valid = categoryInputSchema.safeParse({
      name: 'Plastic Business',
      color: '#1D9E75',
    });
    expect(valid.success).toBe(true);

    const invalid = categoryInputSchema.safeParse({
      name: '',
    });
    expect(invalid.success).toBe(false);
  });

  it('validates note requires title or body', () => {
    const valid = noteInputSchema.safeParse({
      title: 'Discuss proposal',
    });
    expect(valid.success).toBe(true);

    const invalid = noteInputSchema.safeParse({
      title: '',
      body: '',
    });
    expect(invalid.success).toBe(false);
  });
});
