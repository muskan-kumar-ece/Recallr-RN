'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconCrown,
  IconUsers,
  IconScan,
  IconSparkles,
} from '@tabler/icons-react';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { OrangeCorner } from '@/components/ui/OrangeCorner';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { Button } from '@/components/ui/Button';
import { useEntitlements, useUsageCounters, useContacts } from '@recallr/api';

export default function SubscriptionPage() {
  const router = useRouter();
  const { data: entitlements, isLoading: isEntitlementsLoading } = useEntitlements();
  const { data: usageCounters } = useUsageCounters();
  const { data: contacts } = useContacts();

  const isPro = entitlements?.plan === 'pro';
  const contactsCount = contacts?.length ?? 0;
  const contactsLimit = isPro ? 999999 : 50;
  const contactsProgress = isPro ? 0 : Math.min(100, Math.round((contactsCount / 50) * 100));

  // Scans count this month
  const currentMonthKey = new Date().toISOString().slice(0, 7);
  const scanCounter = useMemo(() => {
    return usageCounters?.find((u) => u.kind === 'scan' && u.period_key === currentMonthKey)?.count ?? 0;
  }, [usageCounters, currentMonthKey]);
  const scansLimit = isPro ? 'Unlimited' : 10;
  const scansProgress = isPro ? 0 : Math.min(100, Math.round((scanCounter / 10) * 100));

  // AI questions today
  const todayKey = new Date().toISOString().slice(0, 10);
  const aiCounter = useMemo(() => {
    return usageCounters?.find((u) => u.kind === 'ai_question' && u.period_key === todayKey)?.count ?? 0;
  }, [usageCounters, todayKey]);
  const aiLimit = isPro ? 'Unlimited' : 5;
  const aiProgress = isPro ? 0 : Math.min(100, Math.round((aiCounter / 5) * 100));

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 md:py-6 space-y-4">
      <ScreenHeader
        title="Subscription & Usage"
        subtitle="Manage your Recallr plan and usage limits"
        onBack={() => router.push('/settings')}
      />

      {/* ================= CURRENT PLAN HERO CARD ================= */}
      <Card className="relative p-5 bg-white border border-border overflow-hidden">
        <OrangeCorner
          size="md"
          onClick={() => (!isPro ? router.push('/upgrade') : undefined)}
          title={isPro ? 'Pro Active' : 'Upgrade'}
        >
          <IconCrown size={20} stroke={2.2} />
        </OrangeCorner>

        <div className="pr-14">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-accent" />
            <span className="text-xs font-medium text-accent uppercase tracking-wider">
              Current Plan
            </span>
          </div>
          <h2 className="text-xl font-medium text-text">
            {isEntitlementsLoading ? 'Loading...' : isPro ? 'Pro Plan' : 'Free Plan'}
          </h2>
          <p className="text-xs text-textSecondary mt-0.5">
            {isPro
              ? 'Unlimited contacts, business card scanning, and full AI recall memory.'
              : 'Essential CRM tools for individuals and small networks.'}
          </p>

          {!isPro && (
            <div className="mt-4">
              <Button
                variant="primary"
                size="sm"
                icon={<IconCrown size={16} />}
                onClick={() => router.push('/upgrade')}
              >
                Upgrade to Pro
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* ================= USAGE METERS ================= */}
      <div>
        <h3 className="text-xs font-medium text-textSecondary uppercase tracking-wider mb-2 px-1">
          Plan Usage & Limits
        </h3>
        <Card className="bg-white border border-border p-4 space-y-4">
          {/* Contacts Meter */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-2">
                <IconUsers size={16} className="text-accent" />
                <span className="font-medium text-text">Contacts</span>
              </div>
              <span className="text-textSecondary">
                <strong className="text-text">{contactsCount}</strong> of{' '}
                {isPro ? 'Unlimited' : contactsLimit}
              </span>
            </div>
            {!isPro && <ProgressBar value={contactsProgress} />}
            <p className="text-[11px] text-textMuted mt-1">
              {isPro
                ? 'Unlimited contacts included with your Pro subscription.'
                : `${Math.max(0, 50 - contactsCount)} contacts remaining before Free limit.`}
            </p>
          </div>

          {/* Business Card Scans */}
          <div className="pt-3 border-t border-divider">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-2">
                <IconScan size={16} className="text-accent" />
                <span className="font-medium text-text">Card Scans</span>
              </div>
              <span className="text-textSecondary">
                <strong className="text-text">{scanCounter}</strong> of {scansLimit} this month
              </span>
            </div>
            {!isPro && <ProgressBar value={scansProgress} />}
            <p className="text-[11px] text-textMuted mt-1">
              {isPro
                ? 'Unlimited card scans with high-accuracy OCR extraction.'
                : 'Resets on the 1st of each month.'}
            </p>
          </div>

          {/* AI Recall Questions */}
          <div className="pt-3 border-t border-divider">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <div className="flex items-center gap-2">
                <IconSparkles size={16} className="text-accent" />
                <span className="font-medium text-text">AI Questions</span>
              </div>
              <span className="text-textSecondary">
                <strong className="text-text">{aiCounter}</strong> of {aiLimit} today
              </span>
            </div>
            {!isPro && <ProgressBar value={aiProgress} />}
            <p className="text-[11px] text-textMuted mt-1">
              {isPro
                ? 'Unlimited AI questions and memory queries.'
                : 'Daily Free limit resets at midnight.'}
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
