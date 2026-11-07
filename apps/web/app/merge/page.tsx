'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconGitMerge,
  IconCheck,
  IconUsers,
} from '@tabler/icons-react';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Toast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useContacts, useMergeContacts } from '@recallr/api';
import { isDuplicateMatch, Contact } from '@recallr/core';

export default function MergeDuplicatesPage() {
  const router = useRouter();
  const { data: contacts, isLoading } = useContacts();
  const { mutateAsync: mergeContactsMutate, isPending: isMerging } = useMergeContacts();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedPhone, setSelectedPhone] = useState<'A' | 'B'>('A');
  const [selectedCompany, setSelectedCompany] = useState<'A' | 'B'>('A');
  const [selectedEmail, setSelectedEmail] = useState<'A' | 'B'>('A');
  const [selectedRole, setSelectedRole] = useState<'A' | 'B'>('A');

  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // Compute duplicate pairs from user's live contacts
  const duplicatePairs = useMemo(() => {
    if (!contacts || contacts.length < 2) return [];
    const pairs: [Contact, Contact][] = [];
    const seen = new Set<string>();

    for (let i = 0; i < contacts.length; i++) {
      for (let j = i + 1; j < contacts.length; j++) {
        const c1 = contacts[i];
        const c2 = contacts[j];
        if (c1 && c2 && isDuplicateMatch(c1, c2)) {
          const key = [c1.id, c2.id].sort().join(':');
          if (!seen.has(key)) {
            seen.add(key);
            pairs.push([c1, c2]);
          }
        }
      }
    }
    return pairs;
  }, [contacts]);

  const currentPair = duplicatePairs[currentIndex];
  const contactA = currentPair?.[0];
  const contactB = currentPair?.[1];

  // Reset field selections when pair changes
  useEffect(() => {
    setSelectedPhone('A');
    setSelectedCompany('A');
    setSelectedEmail('A');
    setSelectedRole('A');
  }, [currentIndex]);

  const handleMerge = async () => {
    if (!contactA || !contactB) return;

    try {
      const updates = {
        phone: selectedPhone === 'A' ? contactA.phone : contactB.phone,
        company: selectedCompany === 'A' ? contactA.company : contactB.company,
        email: selectedEmail === 'A' ? contactA.email : contactB.email,
        role: selectedRole === 'A' ? contactA.role : contactB.role,
      };

      await mergeContactsMutate({
        masterId: contactA.id,
        duplicateId: contactB.id,
        mergedData: updates,
      });

      setToastMessage('Merged into 1 contact with combined notes and timeline.');
      setToastVisible(true);

      if (currentIndex + 1 < duplicatePairs.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setTimeout(() => {
          router.push(`/people/${contactA.id}`);
        }, 1200);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to merge contacts';
      setToastMessage(msg);
      setToastVisible(true);
    }
  };

  const handleKeepBoth = () => {
    if (currentIndex + 1 < duplicatePairs.length) {
      setCurrentIndex((prev) => prev + 1);
      setToastMessage('Skipped. Kept both contacts separate.');
      setToastVisible(true);
    } else {
      setToastMessage('Kept both contacts separate');
      setToastVisible(true);
      setTimeout(() => {
        router.push('/people');
      }, 1000);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-4 md:py-6 space-y-4">
        <ScreenHeader title="Merge Duplicates" onBack={() => router.push('/settings')} />
        <Skeleton className="h-28 w-full rounded-card" />
        <Skeleton className="h-44 w-full rounded-card" />
      </div>
    );
  }

  if (duplicatePairs.length === 0 || !contactA || !contactB) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-4 md:py-6 space-y-4">
        <ScreenHeader title="Merge Duplicates" onBack={() => router.push('/settings')} />
        <Card className="p-8 bg-white border border-border text-center">
          <EmptyState
            icon={<IconUsers size={28} />}
            title="No Duplicates Found"
            description="Your network is clean! None of your contacts share the same phone number, email address, or matching name and company."
            primaryAction={{
              label: 'View All Contacts',
              onClick: () => router.push('/people'),
            }}
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 md:py-6 space-y-4">
      <ScreenHeader
        title="Merge Duplicates"
        subtitle={`Duplicate ${currentIndex + 1} of ${duplicatePairs.length} detected`}
        onBack={() => router.push('/settings')}
      />

      <Card className="p-4 bg-accentTintSoft border border-accent/20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-accentTint flex items-center justify-center text-accent">
            <IconGitMerge size={18} />
          </div>
          <div>
            <h3 className="text-xs font-medium text-text">
              Matching contact records found
            </h3>
            <p className="text-[11px] text-textSecondary">
              Review differing details below and choose which information to keep.
            </p>
          </div>
        </div>
      </Card>

      {/* Comparison Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Contact A */}
        <div className="p-4 bg-white rounded-card border border-border space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Avatar name={contactA.name} src={contactA.photo_path || undefined} size="sm" />
            <div className="min-w-0">
              <span className="text-xs font-medium text-text block truncate">
                {contactA.name}
              </span>
              <span className="text-[10px] text-textMuted block truncate">
                Source: {contactA.source}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-accent font-medium uppercase tracking-wider block">
            Master Contact (A)
          </span>
        </div>

        {/* Contact B */}
        <div className="p-4 bg-white rounded-card border border-border space-y-2">
          <div className="flex items-center gap-2 mb-2">
            <Avatar name={contactB.name} src={contactB.photo_path || undefined} size="sm" />
            <div className="min-w-0">
              <span className="text-xs font-medium text-text block truncate">
                {contactB.name}
              </span>
              <span className="text-[10px] text-textMuted block truncate">
                Source: {contactB.source}
              </span>
            </div>
          </div>
          <span className="text-[10px] text-accent font-medium uppercase tracking-wider block">
            Duplicate (B)
          </span>
        </div>
      </div>

      {/* Differing Fields Selector */}
      <Card className="bg-white border border-border p-4 space-y-4">
        {/* Phone Choice */}
        {(contactA.phone || contactB.phone) && (
          <div>
            <label className="block text-xs font-medium text-textSecondary mb-2">
              Primary Phone Number
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedPhone('A')}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                  selectedPhone === 'A'
                    ? 'border-accent bg-accentTintSoft text-text'
                    : 'border-border text-textSecondary'
                }`}
              >
                <span className="font-medium block">{contactA.phone || 'None'}</span>
                <span className="text-[10px] text-textMuted">Keep from Contact A</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPhone('B')}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                  selectedPhone === 'B'
                    ? 'border-accent bg-accentTintSoft text-text'
                    : 'border-border text-textSecondary'
                }`}
              >
                <span className="font-medium block">{contactB.phone || 'None'}</span>
                <span className="text-[10px] text-textMuted">Keep from Contact B</span>
              </button>
            </div>
          </div>
        )}

        {/* Company Choice */}
        {(contactA.company || contactB.company) && (
          <div className="pt-3 border-t border-divider">
            <label className="block text-xs font-medium text-textSecondary mb-2">
              Company Name
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedCompany('A')}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                  selectedCompany === 'A'
                    ? 'border-accent bg-accentTintSoft text-text'
                    : 'border-border text-textSecondary'
                }`}
              >
                <span className="font-medium block">{contactA.company || 'None'}</span>
                <span className="text-[10px] text-textMuted">Keep from Contact A</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedCompany('B')}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                  selectedCompany === 'B'
                    ? 'border-accent bg-accentTintSoft text-text'
                    : 'border-border text-textSecondary'
                }`}
              >
                <span className="font-medium block">{contactB.company || 'None'}</span>
                <span className="text-[10px] text-textMuted">Keep from Contact B</span>
              </button>
            </div>
          </div>
        )}

        {/* Email Choice */}
        {(contactA.email || contactB.email) && (
          <div className="pt-3 border-t border-divider">
            <label className="block text-xs font-medium text-textSecondary mb-2">
              Email Address
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setSelectedEmail('A')}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                  selectedEmail === 'A'
                    ? 'border-accent bg-accentTintSoft text-text'
                    : 'border-border text-textSecondary'
                }`}
              >
                <span className="font-medium block">{contactA.email || 'None'}</span>
                <span className="text-[10px] text-textMuted">Keep from Contact A</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedEmail('B')}
                className={`p-2.5 rounded-xl border text-left text-xs transition-all ${
                  selectedEmail === 'B'
                    ? 'border-accent bg-accentTintSoft text-text'
                    : 'border-border text-textSecondary'
                }`}
              >
                <span className="font-medium block">{contactB.email || 'None'}</span>
                <span className="text-[10px] text-textMuted">Keep from Contact B</span>
              </button>
            </div>
          </div>
        )}

        {/* Merged Items Note */}
        <div className="pt-2 text-xs text-textSecondary bg-bg p-3 rounded-lg flex items-center justify-between">
          <span>All notes, interaction history, and tags will be consolidated into Contact A.</span>
          <IconCheck size={16} className="text-success flex-shrink-0" />
        </div>
      </Card>

      {/* Decision CTAs */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          variant="outline"
          size="md"
          onClick={handleKeepBoth}
          style={{ flex: 1 }}
        >
          Keep Both Separate
        </Button>
        <Button
          variant="primary"
          size="md"
          onClick={handleMerge}
          disabled={isMerging}
          style={{ flex: 1 }}
        >
          {isMerging ? 'Merging...' : 'Merge into One'}
        </Button>
      </div>

      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        actionText="Close"
        onAction={() => setToastVisible(false)}
      />
    </div>
  );
}
