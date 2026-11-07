import { createHmac } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { getUsagePeriodKey, hasValidHmac, paymentExpiry } from './security';

describe('Firebase function security helpers', () => {
  it('requires both a configured secret and a valid signature', () => {
    const body = '{"event":"payment.captured"}';
    const secret = 'test-secret';
    const signature = createHmac('sha256', secret).update(body).digest('hex');
    expect(hasValidHmac(body, signature, secret)).toBe(true);
    expect(hasValidHmac(body, undefined, secret)).toBe(false);
    expect(hasValidHmac(body, signature, undefined)).toBe(false);
    expect(hasValidHmac(`${body} `, signature, secret)).toBe(false);
  });

  it('uses the requested local timezone to determine quota periods', () => {
    const timestamp = new Date('2025-01-31T20:00:00.000Z');
    expect(getUsagePeriodKey('scan', timestamp, 'Asia/Kolkata')).toBe('2025-02');
    expect(getUsagePeriodKey('ai_question', timestamp, 'Asia/Kolkata')).toBe('2025-02-01');
    expect(getUsagePeriodKey('ai_question', timestamp, 'invalid/timezone')).toBe('2025-02-01');
  });

  it('calculates calendar month and year expiry without fixed-day approximations', () => {
    const start = new Date('2024-01-31T12:00:00.000Z');
    expect(paymentExpiry('pro_monthly', start)).toBe('2024-02-29T12:00:00.000Z');
    expect(paymentExpiry('pro_yearly', start)).toBe('2025-01-31T12:00:00.000Z');
  });
});
