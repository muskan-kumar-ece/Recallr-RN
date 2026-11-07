'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconCopy,
  IconRefresh,
  IconTrash,
  IconAlertTriangle,
} from '@tabler/icons-react';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { Toast } from '@/components/ui/Toast';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Skeleton } from '@/components/ui/Skeleton';
import { useMyCard, useUpdateMyCard } from '@recallr/api';

export default function CardSettingsPage() {
  const router = useRouter();
  const { data: card, isLoading } = useMyCard();
  const { mutateAsync: updateCard, isPending: isUpdating } = useUpdateMyCard();

  const [linkActive, setLinkActive] = useState(true);
  const [slug, setSlug] = useState('');
  const [showPhone, setShowPhone] = useState(true);
  const [showEmail, setShowEmail] = useState(true);
  const [showAddress, setShowAddress] = useState(false);
  const [showSocials, setShowSocials] = useState(true);

  // Modals
  const [isRegenerateConfirmOpen, setIsRegenerateConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);

  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (card) {
      setLinkActive(card.is_active !== undefined ? card.is_active : true);
      setSlug(card.slug || `card-${card.id.slice(0, 6)}`);
      if (card.visibility) {
        setShowPhone(card.visibility.phone ?? true);
        setShowEmail(card.visibility.email ?? true);
        setShowAddress(card.visibility.address ?? false);
        setShowSocials(card.visibility.socials ?? true);
      }
    }
  }, [card]);

  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://recallr.app';
  const fullUrl = `${origin}/c/${slug}`;

  const handleCopyLink = () => {
    navigator?.clipboard?.writeText(fullUrl);
    setToastMessage('Link copied to clipboard');
    setToastVisible(true);
  };

  const handleToggleActive = async (val: boolean) => {
    setLinkActive(val);
    if (!card?.id) return;
    try {
      await updateCard({ id: card.id, input: { is_active: val } });
      setToastMessage(val ? 'Card link activated' : 'Card link deactivated');
      setToastVisible(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update status';
      setToastMessage(msg);
      setToastVisible(true);
    }
  };

  const handleSaveSlug = async () => {
    if (!card?.id || !slug.trim()) return;
    try {
      await updateCard({ id: card.id, input: { slug: slug.trim() } });
      setToastMessage('Custom link updated');
      setToastVisible(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update link slug';
      setToastMessage(msg);
      setToastVisible(true);
    }
  };

  const handleConfirmRegenerate = async () => {
    if (!card?.id) return;
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const newSlug = `card-${randomSuffix}`;
    setSlug(newSlug);
    setIsRegenerateConfirmOpen(false);

    try {
      await updateCard({ id: card.id, input: { slug: newSlug } });
      setToastMessage(`New link generated: /c/${newSlug}`);
      setToastVisible(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to regenerate link';
      setToastMessage(msg);
      setToastVisible(true);
    }
  };

  const handleToggleVisibility = async (key: 'phone' | 'email' | 'address' | 'socials', val: boolean) => {
    if (key === 'phone') setShowPhone(val);
    if (key === 'email') setShowEmail(val);
    if (key === 'address') setShowAddress(val);
    if (key === 'socials') setShowSocials(val);

    if (!card?.id) return;
    const currentVis = card.visibility || { phone: true, email: true, address: false, socials: true };
    const newVis = { ...currentVis, [key]: val };

    try {
      await updateCard({ id: card.id, input: { visibility: newVis } });
      setToastMessage('Visibility preferences updated');
      setToastVisible(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update visibility';
      setToastMessage(msg);
      setToastVisible(true);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-4 md:py-6 space-y-4">
        <ScreenHeader title="Card Settings" onBack={() => router.push('/my-card')} />
        <Skeleton className="h-40 w-full rounded-card" />
        <Skeleton className="h-48 w-full rounded-card" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 md:py-6 space-y-4">
      <ScreenHeader
        title="Card Settings"
        subtitle="Manage card visibility and links"
        onBack={() => router.push('/my-card')}
      />

      {/* Card Link Status */}
      <Card className="p-4 bg-white border border-border space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-text">Card Link Active</span>
            <p className="text-[11px] text-textSecondary">
              When switched off, scanning or opening the link shows card unavailable.
            </p>
          </div>
          <Toggle checked={linkActive} onChange={handleToggleActive} />
        </div>

        {linkActive && (
          <div className="pt-2 border-t border-divider space-y-3">
            <div>
              <label className="block text-xs text-textSecondary mb-1">Custom Link Slug</label>
              <div className="flex items-center gap-2 p-2 bg-bg rounded-input border border-border">
                <span className="text-xs text-textMuted select-none">/c/</span>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  onBlur={handleSaveSlug}
                  className="bg-transparent text-xs font-mono font-medium text-text flex-1 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="p-1 text-textSecondary hover:text-text"
                  title="Copy link"
                >
                  <IconCopy size={16} />
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1">
              <span className="text-[11px] text-textMuted">Press outside field to save changes</span>
              <button
                type="button"
                onClick={() => setIsRegenerateConfirmOpen(true)}
                disabled={isUpdating}
                className="text-xs text-textSecondary hover:text-accent flex items-center gap-1"
              >
                <IconRefresh size={14} />
                <span>Regenerate link</span>
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* Show on Card Toggles */}
      <Card className="p-4 bg-white border border-border space-y-3">
        <span className="text-xs font-medium text-textSecondary uppercase tracking-wider block">
          Show on Card
        </span>

        <div className="flex items-center justify-between py-1">
          <div>
            <span className="text-xs font-medium text-text">Phone number</span>
            <p className="text-[10px] text-textSecondary">Allow direct calling</p>
          </div>
          <Toggle checked={showPhone} onChange={(val) => handleToggleVisibility('phone', val)} />
        </div>

        <div className="flex items-center justify-between py-1 border-t border-divider">
          <div>
            <span className="text-xs font-medium text-text">Email address</span>
            <p className="text-[10px] text-textSecondary">Show mail link</p>
          </div>
          <Toggle checked={showEmail} onChange={(val) => handleToggleVisibility('email', val)} />
        </div>

        <div className="flex items-center justify-between py-1 border-t border-divider">
          <div>
            <span className="text-xs font-medium text-text">Address</span>
            <p className="text-[10px] text-textSecondary">Off by default for privacy</p>
          </div>
          <Toggle checked={showAddress} onChange={(val) => handleToggleVisibility('address', val)} />
        </div>

        <div className="flex items-center justify-between py-1 border-t border-divider">
          <div>
            <span className="text-xs font-medium text-text">Social links</span>
            <p className="text-[10px] text-textSecondary">LinkedIn, WhatsApp, and profiles</p>
          </div>
          <Toggle checked={showSocials} onChange={(val) => handleToggleVisibility('socials', val)} />
        </div>
      </Card>

      {/* Danger Zone: Delete Card */}
      <Card className="p-4 bg-white border border-danger/30 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-medium text-danger uppercase tracking-wider block">
              Delete Card
            </span>
            <p className="text-xs text-textSecondary mt-0.5">
              Permanently remove this card and its public link. You must keep at least one card.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="px-3 py-1.5 rounded-button text-xs font-medium text-danger bg-danger/10 hover:bg-danger/20 transition-colors flex items-center gap-1 flex-shrink-0"
          >
            <IconTrash size={14} />
            <span>Delete</span>
          </button>
        </div>
      </Card>

      {/* REGENERATE CONFIRM DIALOG */}
      <BottomSheet
        isOpen={isRegenerateConfirmOpen}
        onClose={() => setIsRegenerateConfirmOpen(false)}
        title="Regenerate Card Link?"
        isDesktopDialog
      >
        <div className="space-y-4 pb-2">
          <div className="p-3 bg-accentTintSoft rounded-card border border-accent/20 flex items-start gap-2.5">
            <IconAlertTriangle size={18} className="text-accent flex-shrink-0 mt-0.5" />
            <p className="text-xs text-text leading-relaxed">
              The old QR code and link will stop working immediately. Anyone who scanned your previous card will no longer be able to reach this page.
            </p>
          </div>

          <div className="flex gap-2.5">
            <Button
              variant="outline"
              size="md"
              onClick={() => setIsRegenerateConfirmOpen(false)}
              style={{ flex: 1 }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              onClick={handleConfirmRegenerate}
              disabled={isUpdating}
              style={{ flex: 1 }}
            >
              {isUpdating ? 'Generating...' : 'Generate New Link'}
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* DELETE CARD CONFIRM DIALOG */}
      <BottomSheet
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        title="Delete this Card?"
        isDesktopDialog
      >
        <div className="space-y-4 pb-2">
          <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">
            You currently have only 1 primary card. Recallr requires you to have at least one active digital business card in your account.
          </p>

          <Button
            variant="outline"
            size="md"
            onClick={() => setIsDeleteConfirmOpen(false)}
            style={{ width: '100%' }}
          >
            Dismiss
          </Button>
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
