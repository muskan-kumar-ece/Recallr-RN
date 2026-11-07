'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IconCopy,
  IconEye,
  IconCheck,
  IconPhone,
  IconBrandWhatsapp,
  IconMail,
  IconWorld,
  IconShare,
  IconQrcode,
  IconPencil,
  IconSettings,
  IconDownload,
} from '@tabler/icons-react';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { Toast } from '@/components/ui/Toast';
import { Chip } from '@/components/ui/Chip';
import { Skeleton } from '@/components/ui/Skeleton';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { LimitReachedSheet } from '@/components/ui/LimitReachedSheet';
import { QRCodeSVG } from 'qrcode.react';
import { useMyCard, useUpdateMyCard, useProfile } from '@recallr/api';
import { useRecallrAuth } from '@/providers/RecallrProvider';

export default function MyCardPage() {
  const router = useRouter();
  const { user } = useRecallrAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: myCard, isLoading: isCardLoading } = useMyCard();
  const { mutate: updateCardMutate } = useUpdateMyCard();

  const [activeColor, setActiveColor] = useState('#E8641B');
  const [linkActive, setLinkActive] = useState(true);
  const [cardLimitOpen, setCardLimitOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (myCard) {
      if (myCard.accent_color) setActiveColor(myCard.accent_color);
      if (myCard.is_active !== undefined) setLinkActive(myCard.is_active);
    }
  }, [myCard]);

  const colorsList = ['#E8641B', '#4F5BD5', '#1D9E75', '#2B2B2B', '#D97706'];

  const publicSlug = myCard?.slug || 'my-card';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://recallr.app';
  const publicUrl = `${origin}/c/${publicSlug}`;

  const cardName = myCard?.name || profile?.full_name || user?.user_metadata?.full_name || 'My Name';
  const cardRole = myCard?.role || 'Founder & Operator';
  const cardCompany = myCard?.company || 'Recallr';

  const handleColorChange = (newColor: string) => {
    setActiveColor(newColor);
    if (myCard?.id) {
      updateCardMutate({ id: myCard.id, input: { accent_color: newColor } });
      setToastMessage('Card accent color updated');
      setToastVisible(true);
    }
  };

  const handleToggleLink = (val: boolean) => {
    setLinkActive(val);
    if (myCard?.id) {
      updateCardMutate({ id: myCard.id, input: { is_active: val } });
      setToastMessage(val ? 'Public card activated' : 'Public card deactivated');
      setToastVisible(true);
    }
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(publicUrl);
    setToastMessage('Link copied to clipboard');
    setToastVisible(true);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 md:py-6 space-y-4">
      <ScreenHeader
        title="My Digital Card"
        subtitle="Manage and share your contact card"
        rightAction={
          <Button
            variant="outline"
            size="sm"
            icon={<IconEye size={16} />}
            onClick={() => router.push(`/c/${publicSlug}`)}
          >
            Preview
          </Button>
        }
      />

      {/* Card Tabs */}
      <div className="flex items-center gap-2 px-0.5">
        <Chip variant="selected">Primary Card</Chip>
        <Chip variant="dashed" onClick={() => setCardLimitOpen(true)}>
          + New Card
        </Chip>
      </div>

      {/* ================= 1. LIVE CARD PREVIEW ================= */}
      {isCardLoading ? (
        <Skeleton className="h-64 w-full rounded-card" />
      ) : (
        <div className="rounded-card overflow-hidden bg-white border border-border shadow-xs">
          {/* Header Banner in Selected Color */}
          <div
            className="h-28 relative flex items-center justify-end px-5 transition-colors duration-300"
            style={{ backgroundColor: activeColor }}
          >
            <div className="w-16 h-16 p-1.5 bg-white rounded-xl shadow-xs flex items-center justify-center">
              <QRCodeSVG value={publicUrl} size={54} />
            </div>
          </div>

          {/* Card Body with Overlapping Avatar */}
          <div className="px-5 pb-5 pt-0 relative">
            <div className="-mt-10 mb-3 flex items-end justify-between">
              <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden shadow-xs">
                <Avatar name={cardName} src={myCard?.photo_path || undefined} size="xl" />
              </div>
              <Link
                href={`/c/${publicSlug}`}
                className="text-xs text-accent font-medium hover:underline flex items-center gap-1"
              >
                <span>View Public Page</span>
                <IconEye size={14} />
              </Link>
            </div>

            <h2 className="text-xl font-medium text-text">{cardName}</h2>
            <p className="text-xs text-textSecondary font-normal mt-0.5">
              {cardRole} {cardRole && cardCompany ? '•' : ''} {cardCompany}
            </p>

            <div className="mt-4 pt-3 border-t border-divider grid grid-cols-4 gap-2">
              <div className="flex flex-col items-center p-2 rounded-xl bg-bg text-center">
                <IconPhone size={18} className="text-accent mb-1" />
                <span className="text-[10px] text-textSecondary">Call</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-xl bg-bg text-center">
                <IconBrandWhatsapp size={18} className="text-accent mb-1" />
                <span className="text-[10px] text-textSecondary">WhatsApp</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-xl bg-bg text-center">
                <IconMail size={18} className="text-accent mb-1" />
                <span className="text-[10px] text-textSecondary">Email</span>
              </div>
              <div className="flex flex-col items-center p-2 rounded-xl bg-bg text-center">
                <IconWorld size={18} className="text-accent mb-1" />
                <span className="text-[10px] text-textSecondary">Web</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= ACTION TILES ================= */}
      <div className="grid grid-cols-4 gap-2.5">
        <button
          type="button"
          onClick={copyLink}
          className="flex flex-col items-center justify-center p-3 rounded-card bg-white border border-border hover:border-accent/40 hover:bg-accentTintSoft transition-all group shadow-xs"
        >
          <div className="w-10 h-10 rounded-[12px] bg-accentTint text-accent flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <IconShare size={20} />
          </div>
          <span className="text-xs font-medium text-text">Share</span>
        </button>

        <button
          type="button"
          onClick={() => setIsQrModalOpen(true)}
          className="flex flex-col items-center justify-center p-3 rounded-card bg-white border border-border hover:border-accent/40 hover:bg-accentTintSoft transition-all group shadow-xs"
        >
          <div className="w-10 h-10 rounded-[12px] bg-accentTint text-accent flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <IconQrcode size={20} />
          </div>
          <span className="text-xs font-medium text-text">Save QR</span>
        </button>

        <button
          type="button"
          onClick={() => router.push('/my-card/edit')}
          className="flex flex-col items-center justify-center p-3 rounded-card bg-white border border-border hover:border-accent/40 hover:bg-accentTintSoft transition-all group shadow-xs"
        >
          <div className="w-10 h-10 rounded-[12px] bg-accentTint text-accent flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <IconPencil size={20} />
          </div>
          <span className="text-xs font-medium text-text">Edit</span>
        </button>

        <button
          type="button"
          onClick={() => router.push('/my-card/settings')}
          className="flex flex-col items-center justify-center p-3 rounded-card bg-white border border-border hover:border-accent/40 hover:bg-accentTintSoft transition-all group shadow-xs"
        >
          <div className="w-10 h-10 rounded-[12px] bg-accentTint text-accent flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <IconSettings size={20} />
          </div>
          <span className="text-xs font-medium text-text">Settings</span>
        </button>
      </div>

      {/* ================= 2. CARD THEME COLOR ================= */}
      <Card className="p-4 bg-white border border-border">
        <label className="block text-xs font-medium text-textSecondary uppercase tracking-wider mb-2.5">
          Card Accent Color
        </label>
        <div className="flex items-center gap-3">
          {colorsList.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => handleColorChange(c)}
              style={{ backgroundColor: c }}
              className={`w-9 h-9 rounded-full flex items-center justify-center text-white transition-all ${
                activeColor === c ? 'ring-2 ring-offset-2 ring-accent scale-110 shadow-xs' : 'hover:scale-105'
              }`}
            >
              {activeColor === c && <IconCheck size={18} stroke={3} />}
            </button>
          ))}
        </div>
      </Card>

      {/* ================= 3. PUBLIC SHARING LINK ================= */}
      <Card className="p-4 bg-white border border-border space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-sm font-medium text-text">Public link active</span>
            <p className="text-[11px] text-textSecondary">Anyone with the link can view your card</p>
          </div>
          <Toggle checked={linkActive} onChange={handleToggleLink} />
        </div>

        <div className="flex items-center gap-2 pt-1 border-t border-divider">
          <input
            type="text"
            readOnly
            value={publicUrl}
            className="flex-1 px-3 py-2 bg-bg rounded-input text-xs font-mono text-text border border-border select-all focus:outline-none"
          />
          <button
            type="button"
            onClick={copyLink}
            className="px-3 py-2 rounded-button bg-accent text-white text-xs font-medium hover:bg-accentPressed transition-colors flex items-center gap-1.5 flex-shrink-0"
          >
            <IconCopy size={14} />
            <span>Copy</span>
          </button>
        </div>
      </Card>

      {/* Full QR Modal */}
      <BottomSheet
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        title="Your Card QR Code"
        isDesktopDialog
      >
        <div className="flex flex-col items-center justify-center p-6 space-y-4">
          <div className="p-4 bg-white rounded-card border border-border shadow-xs">
            <QRCodeSVG value={publicUrl} size={200} />
          </div>
          <div className="text-center">
            <p className="text-sm font-medium text-text">{cardName}</p>
            <p className="text-xs text-textSecondary mt-0.5">{publicUrl}</p>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={<IconDownload size={18} />}
            onClick={() => {
              setToastMessage('QR Code saved');
              setToastVisible(true);
              setIsQrModalOpen(false);
            }}
            style={{ width: '100%' }}
          >
            Done
          </Button>
        </div>
      </BottomSheet>

      {/* Limit Reached Sheet for 2nd card on free */}
      <LimitReachedSheet
        isOpen={cardLimitOpen}
        onClose={() => setCardLimitOpen(false)}
        type="cards"
      />

      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        onAction={() => setToastVisible(false)}
      />
    </div>
  );
}
