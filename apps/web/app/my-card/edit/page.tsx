'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconCheck,
  IconUpload,
  IconGripVertical,
  IconTrash,
  IconPlus,
} from '@tabler/icons-react';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Toast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';
import { LimitReachedSheet } from '@/components/ui/LimitReachedSheet';
import { useMyCard, useUpdateMyCard, useProfile, useUploadFile } from '@recallr/api';
import { useRecallrAuth } from '@/providers/RecallrProvider';

export default function EditCardPage() {
  const router = useRouter();
  const { user } = useRecallrAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: card, isLoading: isCardLoading } = useMyCard();
  const { mutateAsync: updateCard, isPending: isSaving } = useUpdateMyCard();
  const { mutateAsync: uploadFile, isPending: isUploading } = useUploadFile();

  const [activeColor, setActiveColor] = useState('#E8641B');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [company, setCompany] = useState('');
  const [tagline, setTagline] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');
  const [about, setAbout] = useState('');
  const [photoPath, setPhotoPath] = useState<string | null>(null);
  const [logoPath, setLogoPath] = useState<string | null>(null);

  const [socialLinks, setSocialLinks] = useState<{ id: string; platform: string; url: string }[]>([]);

  const [cardLimitOpen, setCardLimitOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const photoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const colors = ['#E8641B', '#4F5BD5', '#1D9E75', '#2B2B2B', '#D97706'];

  // Initialize fields once card data or profile is loaded
  useEffect(() => {
    if (card) {
      setActiveColor(card.accent_color || '#E8641B');
      setName(card.name || profile?.full_name || user?.user_metadata?.full_name || '');
      setRole(card.role || '');
      setCompany(card.company || '');
      setTagline(card.tagline || '');
      setPhone(card.phone || profile?.phone || user?.phone || '');
      setEmail(card.email || profile?.email || user?.email || '');
      setWebsite(card.website || '');
      setAddress(card.address || '');
      setAbout(card.about || '');
      setPhotoPath(card.photo_path || null);
      setLogoPath(card.logo_path || null);

      if (Array.isArray(card.socials) && card.socials.length > 0) {
        setSocialLinks(
          card.socials.map((s, idx) => ({
            id: `${idx}-${s.platform}`,
            platform: s.platform,
            url: s.url,
          }))
        );
      }
    } else if (profile || user) {
      setName(profile?.full_name || user?.user_metadata?.full_name || '');
      setPhone(profile?.phone || user?.phone || '');
      setEmail(profile?.email || user?.email || '');
    }
  }, [card, profile, user]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `cards/${user.id}/photo_${Date.now()}.${ext}`;
      const uploadedPath = await uploadFile({ path, file });
      setPhotoPath(uploadedPath);
      setToastMessage('Profile photo uploaded');
      setToastVisible(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload photo';
      setToastMessage(msg);
      setToastVisible(true);
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user?.id) return;
    try {
      const ext = file.name.split('.').pop() || 'jpg';
      const path = `cards/${user.id}/logo_${Date.now()}.${ext}`;
      const uploadedPath = await uploadFile({ path, file });
      setLogoPath(uploadedPath);
      setToastMessage('Company logo uploaded');
      setToastVisible(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload logo';
      setToastMessage(msg);
      setToastVisible(true);
    }
  };

  const handleSave = async () => {
    try {
      const trimmedWebsite = website.trim();
      const normalizedWebsite = trimmedWebsite
        ? (/^https?:\/\//i.test(trimmedWebsite) ? trimmedWebsite : `https://${trimmedWebsite}`)
        : null;

      const trimmedEmail = email.trim();
      const normalizedEmail = trimmedEmail || null;

      const normalizedSocials = socialLinks
        .filter((s) => s.url && s.url.trim())
        .map((s) => {
          const url = s.url.trim();
          return {
            platform: s.platform,
            url: /^https?:\/\//i.test(url) ? url : `https://${url}`,
          };
        });

      const payload = {
        name: name.trim() || null,
        role: role.trim() || null,
        company: company.trim() || null,
        tagline: tagline.trim() || null,
        phone: phone.trim() || null,
        email: normalizedEmail,
        website: normalizedWebsite,
        address: address.trim() || null,
        about: about.trim() || null,
        accent_color: activeColor || '#E8641B',
        photo_path: photoPath,
        logo_path: logoPath,
        socials: normalizedSocials,
      };

      await updateCard({
        id: card?.id || '',
        input: payload,
      });

      setToastMessage('Card updated successfully');
      setToastVisible(true);
      setTimeout(() => {
        router.push('/my-card');
      }, 700);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save card';
      setToastMessage(msg);
      setToastVisible(true);
    }
  };

  const removeSocial = (id: string) => {
    setSocialLinks((prev) => prev.filter((s) => s.id !== id));
  };

  if (isCardLoading) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-4 md:py-6 space-y-4">
        <ScreenHeader title="Edit Card" onBack={() => router.push('/my-card')} />
        <Skeleton className="h-48 w-full rounded-card" />
        <Skeleton className="h-40 w-full rounded-card" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 md:py-6 space-y-4">
      <ScreenHeader
        title="Edit Card"
        onBack={() => router.push('/my-card')}
        rightAction={
          <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving || isUploading}>
            {isSaving ? 'Saving...' : 'Save'}
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

      {/* Live Preview of the Card */}
      <div className="rounded-card overflow-hidden bg-white border border-border shadow-xs">
        <div
          className="h-20 px-5 flex items-center justify-end transition-colors"
          style={{ backgroundColor: activeColor }}
        />
        <div className="px-5 pb-4 -mt-8">
          <div className="w-16 h-16 rounded-full border-4 border-white overflow-hidden shadow-xs mb-2">
            <Avatar name={name || 'My Name'} src={photoPath || undefined} size="lg" />
          </div>
          <h3 className="text-base font-medium text-text">{name || 'Your Name'}</h3>
          <p className="text-xs text-textSecondary">
            {role || 'Role'} {role && company ? '•' : ''} {company || 'Company'}
          </p>
          {tagline && <p className="text-[11px] text-textMuted mt-0.5">{tagline}</p>}
        </div>
      </div>

      {/* Accent Color Selection */}
      <Card className="p-4 bg-white border border-border">
        <label className="block text-xs font-medium text-textSecondary uppercase tracking-wider mb-2.5">
          Card Accent Color
        </label>
        <div className="flex items-center gap-3">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setActiveColor(c)}
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

      {/* Photo and Logo Upload Tiles */}
      <div className="grid grid-cols-2 gap-2.5">
        <input
          ref={photoInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handlePhotoUpload}
        />
        <input
          ref={logoInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleLogoUpload}
        />

        <div
          onClick={() => photoInputRef.current?.click()}
          className="p-4 rounded-card bg-white border-2 border-dashed border-border hover:border-accent text-center cursor-pointer transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-accentTint text-accent flex items-center justify-center mx-auto mb-1.5">
            <IconUpload size={16} />
          </div>
          <span className="text-xs font-medium text-text block">
            {photoPath ? 'Change Photo' : 'Profile Photo'}
          </span>
          <span className="text-[10px] text-textSecondary">
            {photoPath ? 'Photo uploaded' : 'Tap to upload avatar'}
          </span>
        </div>

        <div
          onClick={() => logoInputRef.current?.click()}
          className="p-4 rounded-card bg-white border-2 border-dashed border-border hover:border-accent text-center cursor-pointer transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-accentTint text-accent flex items-center justify-center mx-auto mb-1.5">
            <IconUpload size={16} />
          </div>
          <span className="text-xs font-medium text-text block">
            {logoPath ? 'Change Logo' : 'Company Logo'}
          </span>
          <span className="text-[10px] text-textSecondary">
            {logoPath ? 'Logo uploaded' : 'Tap to upload brand mark'}
          </span>
        </div>
      </div>

      {/* Basic Info Fields */}
      <Card className="bg-white border border-border p-4 space-y-3">
        <div>
          <label className="block text-xs text-textSecondary mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Alex Sharma"
            className="w-full h-10 px-3 bg-bg rounded-input border border-border text-sm text-text focus:outline-none focus:border-accent"
          />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-xs text-textSecondary mb-1">Role / Job Title</label>
            <input
              type="text"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              placeholder="e.g. Product Lead"
              className="w-full h-10 px-3 bg-bg rounded-input border border-border text-sm text-text focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-xs text-textSecondary mb-1">Company</label>
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="e.g. Acme Labs"
              className="w-full h-10 px-3 bg-bg rounded-input border border-border text-sm text-text focus:outline-none focus:border-accent"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs text-textSecondary mb-1">Tagline</label>
          <input
            type="text"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="A short punchy line describing what you do"
            className="w-full h-10 px-3 bg-bg rounded-input border border-border text-sm text-text focus:outline-none focus:border-accent"
          />
        </div>
      </Card>

      {/* Contact Details */}
      <Card className="bg-white border border-border p-4 space-y-3">
        <div>
          <label className="block text-xs text-textSecondary mb-1">Phone Number</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+91 98765 43210"
            className="w-full h-10 px-3 bg-bg rounded-input border border-border text-sm text-text focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs text-textSecondary mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@domain.com"
            className="w-full h-10 px-3 bg-bg rounded-input border border-border text-sm text-text focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs text-textSecondary mb-1">Website</label>
          <input
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            placeholder="https://example.com"
            className="w-full h-10 px-3 bg-bg rounded-input border border-border text-sm text-text focus:outline-none focus:border-accent"
          />
        </div>

        <div>
          <label className="block text-xs text-textSecondary mb-1">Office Location</label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="City, Country"
            className="w-full h-10 px-3 bg-bg rounded-input border border-border text-sm text-text focus:outline-none focus:border-accent"
          />
        </div>
      </Card>

      {/* Social Links List */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-xs font-medium text-textSecondary uppercase tracking-wider">
            Social Links
          </h3>
          <button
            type="button"
            onClick={() => {
              setSocialLinks((prev) => [
                ...prev,
                { id: `${Date.now()}`, platform: 'LinkedIn', url: 'https://' },
              ]);
            }}
            className="text-xs text-accent font-medium hover:underline flex items-center gap-0.5"
          >
            <IconPlus size={13} />
            <span>Add Link</span>
          </button>
        </div>

        <Card className="bg-white border border-border divide-y divide-divider overflow-hidden">
          {socialLinks.length === 0 ? (
            <div className="p-4 text-center text-xs text-textSecondary">
              No social links added yet. Tap &quot;Add Link&quot; above.
            </div>
          ) : (
            socialLinks.map((s, index) => (
              <div key={s.id} className="p-3 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <IconGripVertical size={16} className="text-textMuted cursor-grab" />
                  <input
                    type="text"
                    value={s.platform}
                    onChange={(e) => {
                      const updated = [...socialLinks];
                      if (updated[index]) {
                        updated[index] = { ...updated[index], platform: e.target.value };
                        setSocialLinks(updated);
                      }
                    }}
                    placeholder="Platform"
                    className="text-xs font-medium text-text w-24 h-7 px-2 bg-bg rounded border border-border focus:outline-none focus:border-accent"
                  />
                  <input
                    type="text"
                    value={s.url}
                    onChange={(e) => {
                      const updated = [...socialLinks];
                      if (updated[index]) {
                        updated[index] = { ...updated[index], url: e.target.value };
                        setSocialLinks(updated);
                      }
                    }}
                    placeholder="URL / Handle"
                    className="text-xs text-textSecondary flex-1 h-7 px-2 bg-bg rounded border border-border focus:outline-none focus:border-accent min-w-0"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeSocial(s.id)}
                  className="text-textMuted hover:text-danger p-1"
                  aria-label="Remove link"
                >
                  <IconTrash size={15} />
                </button>
              </div>
            ))
          )}
        </Card>
      </div>

      {/* About Me */}
      <Card className="bg-white border border-border p-4">
        <label className="block text-xs text-textSecondary mb-1">About Me / Bio</label>
        <textarea
          value={about}
          onChange={(e) => setAbout(e.target.value)}
          rows={3}
          placeholder="Brief intro about yourself or your organization..."
          className="w-full p-3 bg-bg rounded-input border border-border text-sm text-text focus:outline-none focus:border-accent resize-none"
        />
      </Card>

      <Button
        variant="primary"
        size="md"
        onClick={handleSave}
        disabled={isSaving || isUploading}
        style={{ width: '100%' }}
      >
        {isSaving ? 'Saving...' : 'Save Card'}
      </Button>

      <LimitReachedSheet
        isOpen={cardLimitOpen}
        onClose={() => setCardLimitOpen(false)}
        type="cards"
      />

      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        actionText="Close"
        onAction={() => setToastVisible(false)}
      />
    </div>
  );
}
