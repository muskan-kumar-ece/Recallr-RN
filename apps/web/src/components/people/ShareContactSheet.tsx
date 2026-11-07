'use client';

import React, { useState } from 'react';
import {
  IconLock,
  IconBrandWhatsapp,
  IconMessage,
  IconCopy,
  IconAddressBook,
} from '@tabler/icons-react';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Toast } from '@/components/ui/Toast';
import { ContactData } from './ContactProfileView';

export interface ShareContactSheetProps {
  isOpen: boolean;
  onClose: () => void;
  contact: ContactData;
}

export const ShareContactSheet: React.FC<ShareContactSheetProps> = ({
  isOpen,
  onClose,
  contact,
}) => {
  const [includeNameCompany, setIncludeNameCompany] = useState(true);
  const [includePhone, setIncludePhone] = useState(true);
  const [includeEmail, setIncludeEmail] = useState(true);
  const [includeAddress, setIncludeAddress] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const buildShareText = () => {
    const lines: string[] = [];
    if (includeNameCompany) {
      lines.push(`${contact.name}`);
      if (contact.title || contact.company) {
        lines.push(`${contact.title ? contact.title + ' • ' : ''}${contact.company}`);
      }
    }
    if (includePhone && contact.phone) {
      lines.push(`Phone: ${contact.phone}`);
    }
    if (includeEmail && contact.email) {
      lines.push(`Email: ${contact.email}`);
    }
    if (includeAddress && contact.location) {
      lines.push(`Location: ${contact.location}`);
    }
    return lines.join('\n');
  };

  const handleCopy = () => {
    const text = buildShareText();
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(text);
    }
    setToastMessage('Copied contact details to clipboard');
    setToastVisible(true);
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(buildShareText());
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleMessages = () => {
    const text = encodeURIComponent(buildShareText());
    window.open(`sms:?body=${text}`, '_blank');
  };

  const handleDownloadVCard = () => {
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      includeNameCompany ? `FN:${contact.name}` : '',
      includeNameCompany && contact.company ? `ORG:${contact.company}` : '',
      includeNameCompany && contact.title ? `TITLE:${contact.title}` : '',
      includePhone && contact.phone ? `TEL;TYPE=CELL:${contact.phone}` : '',
      includeEmail && contact.email ? `EMAIL;TYPE=INTERNET:${contact.email}` : '',
      includeAddress && contact.location ? `ADR;TYPE=WORK:;;${contact.location};;;;` : '',
      'END:VCARD',
    ]
      .filter(Boolean)
      .join('\r\n');

    const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${contact.name.replace(/\s+/g, '_')}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setToastMessage('Downloaded vCard file');
    setToastVisible(true);
  };

  return (
    <>
      <BottomSheet
        isOpen={isOpen}
        onClose={onClose}
        title={`Share ${contact.name}`}
        isDesktopDialog
      >
        <div className="space-y-4 pb-2">
          {/* Field selection checkboxes */}
          <div className="bg-surface rounded-card border border-border divide-y divide-divider overflow-hidden">
            <label className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-black/[0.015] transition-colors">
              <div className="text-xs sm:text-sm font-medium text-text">
                Name & Company
                <span className="block text-[11px] text-textSecondary font-normal mt-0.5">
                  {contact.name} ({contact.company})
                </span>
              </div>
              <input
                type="checkbox"
                checked={includeNameCompany}
                onChange={(e) => setIncludeNameCompany(e.target.checked)}
                className="w-4 h-4 rounded text-accent focus:ring-accent"
              />
            </label>

            <label className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-black/[0.015] transition-colors">
              <div className="text-xs sm:text-sm font-medium text-text">
                Phone
                <span className="block text-[11px] text-textSecondary font-normal mt-0.5">
                  {contact.phone}
                </span>
              </div>
              <input
                type="checkbox"
                checked={includePhone}
                onChange={(e) => setIncludePhone(e.target.checked)}
                className="w-4 h-4 rounded text-accent focus:ring-accent"
              />
            </label>

            <label className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-black/[0.015] transition-colors">
              <div className="text-xs sm:text-sm font-medium text-text">
                Email
                <span className="block text-[11px] text-textSecondary font-normal mt-0.5">
                  {contact.email}
                </span>
              </div>
              <input
                type="checkbox"
                checked={includeEmail}
                onChange={(e) => setIncludeEmail(e.target.checked)}
                className="w-4 h-4 rounded text-accent focus:ring-accent"
              />
            </label>

            <label className="p-3.5 flex items-center justify-between cursor-pointer hover:bg-black/[0.015] transition-colors">
              <div className="text-xs sm:text-sm font-medium text-text">
                Address & Location
                <span className="block text-[11px] text-textSecondary font-normal mt-0.5">
                  {contact.location}
                </span>
              </div>
              <input
                type="checkbox"
                checked={includeAddress}
                onChange={(e) => setIncludeAddress(e.target.checked)}
                className="w-4 h-4 rounded text-accent focus:ring-accent"
              />
            </label>

            {/* Privacy note */}
            <div className="p-3 bg-bg flex items-center gap-2 text-[11px] text-textMuted">
              <IconLock size={14} className="flex-shrink-0 text-textSecondary" />
              <span>Your notes and files stay private and are never shared.</span>
            </div>
          </div>

          {/* 4 Square Action Tiles */}
          <div className="grid grid-cols-4 gap-2 pt-1">
            <button
              type="button"
              onClick={handleWhatsApp}
              className="flex flex-col items-center justify-center p-3 rounded-card bg-surface border border-border hover:border-accent/40 hover:bg-accentTintSoft transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-accentTint text-accent flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                <IconBrandWhatsapp size={20} />
              </div>
              <span className="text-xs font-medium text-text">WhatsApp</span>
            </button>

            <button
              type="button"
              onClick={handleMessages}
              className="flex flex-col items-center justify-center p-3 rounded-card bg-surface border border-border hover:border-accent/40 hover:bg-accentTintSoft transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-accentTint text-accent flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                <IconMessage size={20} />
              </div>
              <span className="text-xs font-medium text-text">Messages</span>
            </button>

            <button
              type="button"
              onClick={handleCopy}
              className="flex flex-col items-center justify-center p-3 rounded-card bg-surface border border-border hover:border-accent/40 hover:bg-accentTintSoft transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-accentTint text-accent flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                <IconCopy size={20} />
              </div>
              <span className="text-xs font-medium text-text">Copy</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadVCard}
              className="flex flex-col items-center justify-center p-3 rounded-card bg-surface border border-border hover:border-accent/40 hover:bg-accentTintSoft transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-accentTint text-accent flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                <IconAddressBook size={20} />
              </div>
              <span className="text-xs font-medium text-text">Contact File</span>
            </button>
          </div>
        </div>
      </BottomSheet>

      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        actionText="Close"
        onAction={() => setToastVisible(false)}
      />
    </>
  );
};
