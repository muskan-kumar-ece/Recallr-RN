import { PlanType } from './types';

export interface PlanLimits {
  contacts: number; // Maximum non-deleted contacts
  scansPerMonth: number; // Card scans per month
  aiQuestionsPerDay: number; // AI questions per day
  digitalCards: number; // Digital cards limit
  storageBytes: number; // Total document storage in bytes
  canExportContacts: boolean;
}

export const PLANS: Record<PlanType, PlanLimits> = {
  free: {
    contacts: 50,
    scansPerMonth: 10,
    aiQuestionsPerDay: 5,
    digitalCards: 1,
    storageBytes: 100 * 1024 * 1024, // 100 MB
    canExportContacts: false,
  },
  pro: {
    contacts: Infinity,
    scansPerMonth: Infinity,
    aiQuestionsPerDay: Infinity,
    digitalCards: 5,
    storageBytes: 5 * 1024 * 1024 * 1024, // 5 GB
    canExportContacts: true,
  },
};

export const PRICING = {
  monthlyINR: 149,
  yearlyINR: 1199,
  trialDays: 7,
};

export function isFeatureAllowed(
  plan: PlanType,
  feature: keyof PlanLimits,
  currentUsage = 0
): boolean {
  const limit = PLANS[plan][feature];
  if (typeof limit === 'boolean') {
    return limit;
  }
  return currentUsage < limit;
}
