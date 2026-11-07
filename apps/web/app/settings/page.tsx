'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IconId,
  IconBell,
  IconUpload,
  IconDownload,
  IconGitMerge,
  IconCreditCard,
  IconLogout,
  IconTrash,
  IconChevronRight,
  IconSparkles,
} from '@tabler/icons-react';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { OrangeCorner } from '@/components/ui/OrangeCorner';
import { Avatar } from '@/components/ui/Avatar';
import { Toast } from '@/components/ui/Toast';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { useRecallrAuth } from '@/providers/RecallrProvider';
import { useProfile, useEntitlements, useContacts, useUpdateUserSettings, useUserSettings } from '@recallr/api';
import { categories } from '@recallr/tokens';

export default function SettingsPage() {
  const router = useRouter();
  const { user, signOut, deleteAccount } = useRecallrAuth();
  const { data: profile, isLoading: isProfileLoading } = useProfile(user?.id);
  const { data: entitlements } = useEntitlements();
  const { data: contacts } = useContacts();
  const { data: settings } = useUserSettings();
  const { mutateAsync: updateSettings } = useUpdateUserSettings();

  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [isDeleteAccountOpen, setIsDeleteAccountOpen] = useState(false);
  const [deleteConfirmationText, setDeleteConfirmationText] = useState('');
  const [isSigningOut, setIsSigningOut] = useState(false);

  const displayName = profile?.full_name || user?.user_metadata?.full_name || 'My Account';
  const emailOrPhone = profile?.email || user?.email || profile?.phone || user?.phone || 'No email attached';
  const plan = entitlements?.plan === 'pro' ? 'Pro Plan' : 'Free Plan';
  const contactLimit = entitlements?.plan === 'pro' ? 'Unlimited' : '50';
  const contactsCount = contacts?.length ?? 0;

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      await signOut();
      router.replace('/sign-in');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to sign out';
      setToastMessage(msg);
      setToastVisible(true);
      setIsSigningOut(false);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      setIsDeleteAccountOpen(false);
      router.replace('/sign-in');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete account';
      setToastMessage(msg);
      setToastVisible(true);
    }
  };

  const handleExport = () => {
    if (!contacts || contacts.length === 0) {
      setToastMessage('No contacts found to export');
      setToastVisible(true);
      return;
    }

    const headers = ['Name', 'Phone', 'Email', 'Company', 'Role', 'Address', 'Met Where', 'Tags', 'Created At'];
    const rows = contacts.map((c) => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${(c.phone || '').replace(/"/g, '""')}"`,
      `"${(c.email || '').replace(/"/g, '""')}"`,
      `"${(c.company || '').replace(/"/g, '""')}"`,
      `"${(c.role || '').replace(/"/g, '""')}"`,
      `"${(c.address || '').replace(/"/g, '""')}"`,
      `"${(c.met_where || '').replace(/"/g, '""')}"`,
      `"${(c.tags || []).join('; ').replace(/"/g, '""')}"`,
      `"${c.created_at || ''}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `recallr_contacts_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage(`Exported ${contacts.length} contacts to CSV`);
    setToastVisible(true);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 md:py-6 space-y-4">
      <ScreenHeader title="Settings" subtitle="Account and preferences" />

      {/* ================= PROFILE CARD WITH ORANGE CORNER ================= */}
      <Card className="relative p-5 bg-white border border-border overflow-hidden">
        <OrangeCorner
          size="md"
          onClick={() => router.push('/my-card')}
          title="My Digital Card"
        >
          <IconId size={20} stroke={2.2} />
        </OrangeCorner>

        <div className="flex items-center gap-4 pr-14">
          {isProfileLoading ? (
            <Skeleton variant="circle" className="w-14 h-14" />
          ) : (
            <Avatar name={displayName} size="lg" />
          )}

          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-medium text-text truncate">
              {displayName}
            </h2>
            <p className="text-xs text-textSecondary truncate">
              {emailOrPhone}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-[10px] font-medium bg-fill text-text px-2 py-0.5 rounded-[4px]">
                {plan}
              </span>
              {entitlements?.plan !== 'pro' && (
                <Link
                  href="/settings/subscription"
                  className="text-xs text-accent font-medium hover:underline flex items-center gap-0.5"
                >
                  <span>Upgrade to Pro</span>
                  <IconSparkles size={13} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* ================= PREFERENCES ================= */}
      <div>
        <h3 className="text-xs font-medium text-textSecondary uppercase tracking-wider mb-2 px-1">
          Preferences
        </h3>
        <Card className="bg-white border border-border divide-y divide-divider overflow-hidden">
          <Link
            href="/settings/notifications"
            className="p-3.5 flex items-center justify-between hover:bg-black/[0.015] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[10px] bg-accentTint flex items-center justify-center text-accent">
                <IconBell size={18} />
              </div>
              <div>
                <div className="text-sm font-medium text-text">
                  Notifications & Follow-ups
                </div>
                <div className="text-[11px] text-textSecondary">
                  Daily nudges, alerts & quiet hours
                </div>
              </div>
            </div>
            <IconChevronRight size={18} className="text-textMuted" />
          </Link>
        </Card>
      </div>

      <div>
        <h3 className="text-xs font-medium text-textSecondary uppercase tracking-wider mb-2 px-1">Appearance</h3>
        <Card className="bg-white border border-border p-4">
          <p className="text-sm font-medium text-text mb-3">Color theme</p>
          <div className="flex gap-3" role="radiogroup" aria-label="Color theme">
            {Object.entries(categories).map(([theme, color]) => (
              <button
                key={theme}
                type="button"
                role="radio"
                aria-checked={(settings?.accent_theme ?? 'orange') === theme}
                aria-label={`${theme} theme`}
                onClick={() => void updateSettings({ accent_theme: theme as 'orange' | 'indigo' | 'teal' | 'pink' | 'slate' }).catch((error: unknown) => {
                  setToastMessage(error instanceof Error ? error.message : 'Could not save color theme');
                  setToastVisible(true);
                })}
                className="w-10 h-10 rounded-full border-2 border-white ring-2 ring-transparent aria-checked:ring-text focus-visible:outline-none focus-visible:ring-accent"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </Card>
      </div>

      {/* ================= DATA & NETWORK ================= */}
      <div>
        <h3 className="text-xs font-medium text-textSecondary uppercase tracking-wider mb-2 px-1">
          Data & Network
        </h3>
        <Card className="bg-white border border-border divide-y divide-divider overflow-hidden">
          <Link
            href="/import"
            className="p-3.5 flex items-center justify-between hover:bg-black/[0.015] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[10px] bg-accentTint flex items-center justify-center text-accent">
                <IconUpload size={18} />
              </div>
              <div>
                <div className="text-sm font-medium text-text">
                  Import Contacts
                </div>
                <div className="text-[11px] text-textSecondary">
                  Upload CSV or Google Contacts (.vcf)
                </div>
              </div>
            </div>
            <IconChevronRight size={18} className="text-textMuted" />
          </Link>

          <button
            type="button"
            onClick={handleExport}
            className="w-full p-3.5 flex items-center justify-between hover:bg-black/[0.015] transition-colors text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[10px] bg-accentTint flex items-center justify-center text-accent">
                <IconDownload size={18} />
              </div>
              <div>
                <div className="text-sm font-medium text-text">
                  Export Contacts
                </div>
                <div className="text-[11px] text-textSecondary">
                  Download all {contactsCount} contacts as CSV
                </div>
              </div>
            </div>
            <IconChevronRight size={18} className="text-textMuted" />
          </button>

          <Link
            href="/merge"
            className="p-3.5 flex items-center justify-between hover:bg-black/[0.015] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[10px] bg-accentTint flex items-center justify-center text-accent">
                <IconGitMerge size={18} />
              </div>
              <div>
                <div className="text-sm font-medium text-text">
                  Merge Duplicates
                </div>
                <div className="text-[11px] text-textSecondary">
                  Review & clean up duplicate contacts
                </div>
              </div>
            </div>
            <IconChevronRight size={18} className="text-textMuted" />
          </Link>
        </Card>
      </div>

      {/* ================= SUBSCRIPTION ================= */}
      <div>
        <h3 className="text-xs font-medium text-textSecondary uppercase tracking-wider mb-2 px-1">
          Subscription
        </h3>
        <Card className="bg-white border border-border divide-y divide-divider overflow-hidden">
          <Link
            href="/settings/subscription"
            className="p-3.5 flex items-center justify-between hover:bg-black/[0.015] transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-[10px] bg-accentTint flex items-center justify-center text-accent">
                <IconCreditCard size={18} />
              </div>
              <div>
                <div className="text-sm font-medium text-text">
                  Plan & Usage
                </div>
                <div className="text-[11px] text-textSecondary">
                  {contactsCount}/{contactLimit} contacts used on {plan}
                </div>
              </div>
            </div>
            <IconChevronRight size={18} className="text-textMuted" />
          </Link>
        </Card>
      </div>

      {/* ================= ACCOUNT ACTIONS ================= */}
      <div className="pt-2 pb-6 space-y-2 flex flex-col items-center">
        <button
          type="button"
          disabled={isSigningOut}
          onClick={handleSignOut}
          className="text-xs text-textSecondary hover:text-text font-medium flex items-center gap-1.5 py-2 px-4 rounded-button hover:bg-black/[0.03] transition-colors disabled:opacity-50"
        >
          <IconLogout size={16} />
          <span>{isSigningOut ? 'Signing out...' : 'Sign Out'}</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setDeleteConfirmationText('');
            setIsDeleteAccountOpen(true);
          }}
          className="text-xs text-danger font-medium hover:underline flex items-center gap-1.5 py-1 px-3"
        >
          <IconTrash size={14} />
          <span>Delete Account</span>
        </button>
      </div>

      {/* DELETE ACCOUNT CONFIRMATION DIALOG (Per AGENTS.md rule 9 exception) */}
      <BottomSheet
        isOpen={isDeleteAccountOpen}
        onClose={() => setIsDeleteAccountOpen(false)}
        title="Delete Your Account?"
        isDesktopDialog
      >
        <div className="space-y-4 pb-2">
          <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
            This will permanently delete all your contacts, business card scans, notes, reminders, and digital cards. This action cannot be undone.
          </p>

          <div>
            <label className="block text-xs font-medium text-textSecondary mb-1.5">
              Type <strong className="text-danger font-mono font-bold">DELETE</strong> to confirm:
            </label>
            <input
              type="text"
              value={deleteConfirmationText}
              onChange={(e) => setDeleteConfirmationText(e.target.value)}
              placeholder="DELETE"
              className="w-full h-10 px-3 bg-bg rounded-input border border-border text-sm font-mono text-text focus:outline-none focus:border-danger"
            />
          </div>

          <div className="flex gap-2.5 pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsDeleteAccountOpen(false)}
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              disabled={deleteConfirmationText !== 'DELETE'}
              onClick={handleDeleteAccount}
              className="bg-danger hover:bg-danger/90 text-white border-transparent"
              style={{ flex: 1 }}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </BottomSheet>

      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        actionText="Close"
        onAction={() => setToastVisible(false)}
      />
    </div>
  );
}
