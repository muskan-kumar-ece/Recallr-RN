'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconPhoto,
  IconAlertCircle,
} from '@tabler/icons-react';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { Toggle } from '@/components/ui/Toggle';
import { Toast } from '@/components/ui/Toast';
import {
  useCreateContact,
  useCreateNote,
  useCategories,
  useContacts,
} from '@recallr/api';
import { isDuplicateMatch } from '@recallr/core';

export default function ScanReviewPage() {
  const router = useRouter();

  const { data: dbCategories } = useCategories();
  const { data: existingContacts } = useContacts();
  const { mutateAsync: createContactAsync, isPending: isSavingContact } = useCreateContact();
  const { mutateAsync: createNoteAsync } = useCreateNote();

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [metWhere, setMetWhere] = useState('');
  const [cardImagePath, setCardImagePath] = useState<string | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Categories
  const [selectedCatId, setSelectedCatId] = useState<string>('');

  // Follow-up
  const [setFollowUp, setSetFollowUp] = useState(true);
  const [followUpTiming, setFollowUpTiming] = useState<'Tomorrow 9 AM' | 'In 3 days' | 'Next week'>('In 3 days');

  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('pending_scanned_contact');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setName(parsed.name || '');
          setRole(parsed.role || '');
          setCompany(parsed.company || '');
          setPhone(parsed.phone || '');
          setEmail(parsed.email || '');
          setAddress(parsed.address || '');
          setMetWhere(parsed.met_where || 'Business card scan');
          setCardImagePath(parsed.card_image_path || null);
          if (parsed.photoPreview) {
            setPhotoPreview(parsed.photoPreview);
          }
        } catch {
          console.warn('Failed to parse pending scanned contact');
        }
      }
    }
  }, []);

  const categories = dbCategories || [];

  // Check for duplicate in user's existing contacts
  const duplicateMatch = useMemo(() => {
    if (!existingContacts || !name.trim()) return null;
    return existingContacts.find((c) =>
      isDuplicateMatch(
        { name: c.name, phone: c.phone, email: c.email, company: c.company },
        { name, phone, email, company }
      )
    );
  }, [existingContacts, name, phone, email, company]);

  const handleSave = async () => {
    if (!name.trim()) {
      setToastMessage('Please enter at least a contact name');
      setToastVisible(true);
      return;
    }

    try {
      const newContact = await createContactAsync({
        input: {
          name: name.trim(),
          role: role.trim() || null,
          company: company.trim() || null,
          phone: phone.trim() || null,
          email: email.trim() || null,
          address: address.trim() || null,
          met_where: metWhere.trim() || null,
          category_ids: selectedCatId ? [selectedCatId] : [],
          tags: ['Scanned'],
          links: [],
          source: 'scan',
          card_image_path: cardImagePath,
        },
      });

      // Optionally schedule follow-up reminder
      if (setFollowUp) {
        const now = new Date();
        const days = followUpTiming === 'Tomorrow 9 AM' ? 1 : followUpTiming === 'In 3 days' ? 3 : 7;
        const remindAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
        remindAt.setHours(9, 0, 0, 0);

        await createNoteAsync({
          input: {
            contact_id: newContact.id,
            title: `Follow up with ${newContact.name}`,
            body: `Met via business card scan (${company || 'their organization'}).`,
            remind_at: remindAt.toISOString(),
            repeat: 'none',
          },
        });
      }

      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('pending_scanned_contact');
      }

      setToastMessage(`Saved ${newContact.name} to Recallr`);
      setToastVisible(true);
      setTimeout(() => {
        router.push(`/people/${newContact.id}`);
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save contact';
      setToastMessage(msg);
      setToastVisible(true);
    }
  };

  const handleSaveAndScanAnother = async () => {
    await handleSave();
    setTimeout(() => {
      router.push('/scan');
    }, 800);
  };

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 md:py-6 space-y-4">
      {/* Top bar with Retake */}
      <ScreenHeader
        title="Review Scanned Card"
        onBack={() => router.push('/scan')}
        rightAction={
          <button
            type="button"
            onClick={() => router.push('/scan')}
            className="text-xs font-medium text-accent hover:underline px-2 py-1"
          >
            Retake Photo
          </button>
        }
      />

      {/* 1. Card Thumbnail Preview */}
      <Card className="p-3.5 bg-white border border-border flex items-center gap-3.5">
        <div className="w-16 h-12 rounded-lg bg-fill border border-border overflow-hidden flex items-center justify-center text-textMuted flex-shrink-0">
          {photoPreview ? (
            <img src={photoPreview} alt="Scanned Card" className="w-full h-full object-cover" />
          ) : (
            <IconPhoto size={24} />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-xs sm:text-sm font-medium text-text">Card details extracted</div>
          <div className="text-[11px] text-textSecondary">
            Review and adjust AI detected details below
          </div>
        </div>
      </Card>

      {/* 2. Duplicate Warning Banner */}
      {duplicateMatch && (
        <div className="p-3 bg-accentTintSoft border border-accent/30 rounded-card flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-text">
            <IconAlertCircle size={16} className="text-accent flex-shrink-0" />
            <span>
              <strong>{duplicateMatch.name}</strong> may already exist in your contacts.
            </span>
          </div>
          <button
            type="button"
            onClick={() => router.push(`/people/${duplicateMatch.id}`)}
            className="text-accent font-medium hover:underline flex-shrink-0"
          >
            View Existing
          </button>
        </div>
      )}

      {/* 3. Form Fields */}
      <div className="space-y-4">
        {/* Name & Title */}
        <Card className="bg-white border border-border p-4 space-y-3">
          <div>
            <label className="block text-xs text-textSecondary mb-1">Full Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="w-full h-10 px-3 bg-bg rounded-input border border-border text-sm text-text focus:outline-none focus:border-accent font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-textSecondary mb-1">Role / Title</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Managing Director"
                className="w-full h-10 px-3 bg-bg rounded-input border border-border text-sm text-text focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-xs text-textSecondary mb-1">Company</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="e.g. Apex Corp"
                className="w-full h-10 px-3 bg-bg rounded-input border border-border text-sm text-text focus:outline-none focus:border-accent"
              />
            </div>
          </div>
        </Card>

        {/* Contact Coordinates */}
        <Card className="bg-white border border-border p-4 space-y-3">
          <div>
            <label className="block text-xs text-textSecondary mb-1">Phone</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91..."
              className="w-full h-10 px-3 bg-bg rounded-input border border-border text-sm text-text focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs text-textSecondary mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@example.com"
              className="w-full h-10 px-3 bg-bg rounded-input border border-border text-sm text-text focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs text-textSecondary mb-1">Address</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address / City"
              className="w-full h-10 px-3 bg-bg rounded-input border border-border text-sm text-text focus:outline-none focus:border-accent"
            />
          </div>
        </Card>

        {/* Categories */}
        <Card className="bg-white border border-border p-4">
          <label className="block text-xs text-textSecondary mb-2">Category</label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Chip
                key={cat.id}
                variant={selectedCatId === cat.id ? 'selected' : 'default'}
                onClick={() => setSelectedCatId(selectedCatId === cat.id ? '' : cat.id)}
              >
                {cat.name}
              </Chip>
            ))}
          </div>
        </Card>

        {/* Follow-up Reminder Toggle */}
        <Card className="p-4 bg-white border border-border space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-text">Follow-up reminder</span>
              <p className="text-[11px] text-textSecondary">
                Schedule an automatic reminder to reach out
              </p>
            </div>
            <Toggle checked={setFollowUp} onChange={setSetFollowUp} />
          </div>

          {setFollowUp && (
            <div className="pt-2 border-t border-divider flex flex-wrap gap-2">
              {(['Tomorrow 9 AM', 'In 3 days', 'Next week'] as const).map((chip) => (
                <Chip
                  key={chip}
                  variant={followUpTiming === chip ? 'selected' : 'default'}
                  onClick={() => setFollowUpTiming(chip)}
                >
                  {chip}
                </Chip>
              ))}
            </div>
          )}
        </Card>

        {/* Actions */}
        <div className="space-y-2 pt-2">
          <Button
            variant="primary"
            size="md"
            onClick={handleSave}
            disabled={isSavingContact}
            className="w-full"
          >
            {isSavingContact ? 'Saving...' : 'Save Contact'}
          </Button>
          <Button
            variant="outline"
            size="md"
            onClick={handleSaveAndScanAnother}
            disabled={isSavingContact}
            className="w-full"
          >
            Save & Scan Another Card
          </Button>
        </div>
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
