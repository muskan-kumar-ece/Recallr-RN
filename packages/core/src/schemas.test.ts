import { describe, expect, it } from 'vitest';
import { firebaseAIActionProposalSchema, firebaseScanCardOutputSchema, userSettingsInputSchema } from './schemas';

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
