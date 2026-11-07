'use client';

import React, { useState } from 'react';
import {
  IconPhone,
  IconBrandWhatsapp,
  IconMail,
  IconWorld,
  IconDownload,
  IconMapPin,
  IconCheck,
  IconIdOff,
} from '@tabler/icons-react';
import { Avatar } from '@/components/ui/Avatar';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { usePublicCard } from '@recallr/api';
import { useRouteParam } from '@/hooks/useRouteParam';

export default function PublicCardClient() {
  const slug = useRouteParam('slug');
  const { data: publicCard, isLoading } = usePublicCard(slug);
  const [downloaded, setDownloaded] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-[420px] bg-white rounded-card border border-border shadow-xs overflow-hidden">
          <Skeleton className="h-32 w-full" />
          <div className="p-6 space-y-3">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-full rounded-button" />
          </div>
        </div>
      </div>
    );
  }

  if (!publicCard) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4 sm:p-6">
        <div className="w-full max-w-[420px]">
          <EmptyState
            icon={<IconIdOff size={28} />}
            title="Card Not Found"
            description={`The digital business card for "${slug}" does not exist or is currently inactive.`}
          />
        </div>
      </div>
    );
  }

  const name = (publicCard.name as string) || 'Recallr User';
  const role = (publicCard.role as string) || '';
  const company = (publicCard.company as string) || '';
  const about = (publicCard.about as string) || (publicCard.tagline as string) || '';
  const phone = (publicCard.phone as string) || '';
  const email = (publicCard.email as string) || '';
  const website = (publicCard.website as string) || '';
  const address = (publicCard.address as string) || '';
  const accentColor = (publicCard.accent_color as string) || '#E8641B';

  const handleDownloadVCard = () => {
    const vCardData = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${name}`,
      company ? `ORG:${company}` : '',
      role ? `TITLE:${role}` : '',
      phone ? `TEL;TYPE=CELL:${phone}` : '',
      email ? `EMAIL:${email}` : '',
      website ? `URL:${website}` : '',
      address ? `ADR;TYPE=WORK:;;;${address};;;` : '',
      'END:VCARD',
    ]
      .filter(Boolean)
      .join('\n');

    const blob = new Blob([vCardData], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${name.replace(/\s+/g, '_')}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  };

  return (
    <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-[420px] bg-white rounded-card border border-border shadow-md overflow-hidden">
        {/* Header Banner */}
        <div
          className="h-32 w-full relative transition-colors"
          style={{ backgroundColor: accentColor }}
        >
          <div className="absolute top-3 right-3 px-2 py-1 bg-black/20 rounded-full text-[10px] text-white font-medium backdrop-blur-xs">
            Digital Business Card
          </div>
        </div>

        {/* Identity & Actions */}
        <div className="px-6 pb-6 pt-0 relative">
          <div className="-mt-12 mb-3 flex items-end justify-between">
            <div className="w-24 h-24 rounded-full border-4 border-white shadow-xs overflow-hidden bg-accentTint">
              <Avatar name={name} src={publicCard.photo_path as string | undefined} size="xl" />
            </div>
          </div>

          <h1 className="text-2xl font-medium text-text">{name}</h1>
          {(role || company) && (
            <p className="text-xs sm:text-sm text-textSecondary font-normal mt-0.5">
              {role} {role && company ? '•' : ''} {company}
            </p>
          )}

          {about && (
            <p className="text-xs text-textSecondary mt-2.5 leading-relaxed bg-bg p-3 rounded-card border border-divider">
              {about}
            </p>
          )}

          {/* Action Row */}
          <div className="grid grid-cols-3 gap-2 mt-4">
            {phone ? (
              <a
                href={`tel:${phone}`}
                className="flex flex-col items-center justify-center p-3 rounded-card bg-bg border border-border hover:border-accent hover:bg-accentTintSoft transition-all"
              >
                <IconPhone size={20} className="text-accent mb-1" />
                <span className="text-xs font-medium text-text">Call</span>
              </a>
            ) : null}

            {phone ? (
              <a
                href={`https://wa.me/${phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-card bg-bg border border-border hover:border-accent hover:bg-accentTintSoft transition-all"
              >
                <IconBrandWhatsapp size={20} className="text-accent mb-1" />
                <span className="text-xs font-medium text-text">WhatsApp</span>
              </a>
            ) : null}

            {email ? (
              <a
                href={`mailto:${email}`}
                className="flex flex-col items-center justify-center p-3 rounded-card bg-bg border border-border hover:border-accent hover:bg-accentTintSoft transition-all"
              >
                <IconMail size={20} className="text-accent mb-1" />
                <span className="text-xs font-medium text-text">Email</span>
              </a>
            ) : null}
          </div>

          {/* Details */}
          <div className="mt-4 pt-4 border-t border-divider space-y-2.5 text-xs text-textSecondary">
            {phone && (
              <div className="flex items-center gap-2.5">
                <IconPhone size={16} className="text-textMuted flex-shrink-0" />
                <span className="text-text font-medium">{phone}</span>
              </div>
            )}
            {email && (
              <div className="flex items-center gap-2.5">
                <IconMail size={16} className="text-textMuted flex-shrink-0" />
                <span className="text-text font-medium">{email}</span>
              </div>
            )}
            {website && (
              <div className="flex items-center gap-2.5">
                <IconWorld size={16} className="text-textMuted flex-shrink-0" />
                <a
                  href={website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-accent hover:underline font-medium truncate"
                >
                  {website}
                </a>
              </div>
            )}
            {address && (
              <div className="flex items-center gap-2.5">
                <IconMapPin size={16} className="text-textMuted flex-shrink-0" />
                <span>{address}</span>
              </div>
            )}
          </div>

          {/* Save Contact / Download vCard Button */}
          <div className="mt-6">
            <Button
              variant="primary"
              size="md"
              icon={downloaded ? <IconCheck size={18} /> : <IconDownload size={18} />}
              onClick={handleDownloadVCard}
              style={{ width: '100%', backgroundColor: accentColor }}
            >
              {downloaded ? 'Saved to Contacts!' : 'Save Contact (.vcf)'}
            </Button>
          </div>
        </div>
      </div>

      <p className="text-[11px] text-textMuted mt-4 flex items-center gap-1">
        Powered by <strong className="text-text font-medium">Recallr</strong>
      </p>
    </div>
  );
}
