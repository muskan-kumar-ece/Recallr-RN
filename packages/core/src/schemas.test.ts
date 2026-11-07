import { describe, expect, it } from 'vitest';
import {
  digitalCardInputSchema,
  firebaseAIActionProposalSchema,
  firebaseAIChatInputSchema,
  firebaseScanCardOutputSchema,
  userSettingsInputSchema,
} from './schemas';

describe('user settings schema', () => {
  it('accepts each documented accent theme', () => {
    for (const accent_theme of ['orange', 'indigo', 'teal', 'pink', 'slate'] as const) {
      expect(userSettingsInputSchema.parse({ accent_theme }).accent_theme).toBe(accent_theme);
    }
  });

  it('rejects accent themes outside the documented palette', () => {
    expect(userSettingsInputSchema.safeParse({ accent_theme: 'violet' }).success).toBe(false);
  });
});

describe('scan card result schema', () => {
  it('keeps confidence values available for review flags', () => {
    const result = firebaseScanCardOutputSchema.parse({ name: 'Asha Rao', confidence: { name: 0.72 } });
    expect(result.name).toBe('Asha Rao');
    expect(result.confidence.name).toBe(0.72);
  });

  it('validates emails during scan and nullifies invalid email strings', () => {
    const valid = firebaseScanCardOutputSchema.parse({ email: 'asha@example.com', confidence: {} });
    expect(valid.email).toBe('asha@example.com');

    const invalid = firebaseScanCardOutputSchema.parse({ email: 'invalid-email-text', confidence: {} });
    expect(invalid.email).toBeNull();
  });
});

describe('digital card input schema', () => {
  it('normalizes slug to lowercase alphanumeric with hyphens', () => {
    const parsed = digitalCardInputSchema.parse({ slug: 'My Card 2026' });
    expect(parsed.slug).toBe('my-card-2026');
  });

  it('auto-prefixes website and social urls with https', () => {
    const parsed = digitalCardInputSchema.parse({
      slug: 'my-card',
      website: 'example.com',
      socials: [{ platform: 'x', url: 'x.com/profile' }],
    });
    expect(parsed.website).toBe('https://example.com');
    expect(parsed.socials?.[0]?.url).toBe('https://x.com/profile');
  });

  it('allows empty email and website as null', () => {
    const parsed = digitalCardInputSchema.parse({ slug: 'my-card', email: '', website: '' });
    expect(parsed.email).toBeNull();
    expect(parsed.website).toBeNull();
  });
});

describe('AI action proposals', () => {
  it('accepts multi-step proposals with supported write actions', () => {
    const proposal = firebaseAIActionProposalSchema.parse({
      kind: 'propose_batch',
      actions: [
        { kind: 'propose_update_contact', contact_id: 'contact-1', changes: { role: 'Buyer' } },
        { kind: 'propose_add_note', contact_id: 'contact-1', body: 'Met at the trade show' },
        { kind: 'propose_set_reminder', contact_id: 'contact-1', title: 'Follow up', remind_at: '2026-11-10T09:00:00+05:30' },
      ],
    });
    expect(proposal.kind).toBe('propose_batch');
  });

  it('requires at least two actions for a batch', () => {
    expect(firebaseAIActionProposalSchema.safeParse({
      kind: 'propose_batch',
      actions: [{ kind: 'propose_add_contact', name: 'Asha' }],
    }).success).toBe(false);
  });
});

describe('AI chat input schema', () => {
  it('accepts valid messages with or without conversationId', () => {
    expect(firebaseAIChatInputSchema.safeParse({ message: 'Hello' }).success).toBe(true);
    expect(firebaseAIChatInputSchema.safeParse({ message: 'Hello', conversationId: undefined }).success).toBe(true);
    expect(firebaseAIChatInputSchema.safeParse({ message: 'Hello', conversationId: null }).success).toBe(true);
    expect(firebaseAIChatInputSchema.safeParse({ message: 'Hello', conversationId: '' }).success).toBe(true);
    expect(firebaseAIChatInputSchema.safeParse({ message: 'Hello', conversationId: 'conv_123' }).success).toBe(true);
  });

  it('rejects empty or excessively long messages', () => {
    expect(firebaseAIChatInputSchema.safeParse({ message: '' }).success).toBe(false);
    expect(firebaseAIChatInputSchema.safeParse({ message: '   ' }).success).toBe(false);
    expect(firebaseAIChatInputSchema.safeParse({ message: 'a'.repeat(2001) }).success).toBe(false);
  });
});
