'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  ContactProfileView,
  ContactData,
} from '@/components/people/ContactProfileView';
import { ShareContactSheet } from '@/components/people/ShareContactSheet';
import { ContactMoreMenuSheet } from '@/components/people/ContactMoreMenuSheet';
import { Toast } from '@/components/ui/Toast';
import { IconShare, IconDotsVertical, IconUserX } from '@tabler/icons-react';
import { useContact, useDeleteContact, useRestoreContact } from '@recallr/api';

export default function ContactDetailClient() {
  const router = useRouter();
  const params = useParams();
  const contactId = params?.id as string;

  const { data: dbContact, isLoading } = useContact(contactId);
  const { mutate: deleteContactMutate } = useDeleteContact();
  const { mutate: restoreContactMutate } = useRestoreContact();

  const [shareOpen, setShareOpen] = useState(false);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const [lastDeletedId, setLastDeletedId] = useState<string | null>(null);

  const handleDeleteContact = () => {
    if (!dbContact) return;
    setLastDeletedId(dbContact.id);
    deleteContactMutate({ id: dbContact.id, soft: true });
    setToastMessage(`${dbContact.name} deleted`);
    setToastVisible(true);

    setTimeout(() => {
      router.push('/people');
    }, 4500);
  };

  const handleUndoDelete = () => {
    if (lastDeletedId) {
      restoreContactMutate(lastDeletedId);
      setLastDeletedId(null);
      setToastVisible(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-4 md:py-6 space-y-4">
        <ScreenHeader title="" onBack={() => router.push('/people')} />
        <Skeleton className="h-44 w-full rounded-card" />
        <div className="grid grid-cols-4 gap-2.5">
          <Skeleton className="h-20 rounded-card" />
          <Skeleton className="h-20 rounded-card" />
          <Skeleton className="h-20 rounded-card" />
          <Skeleton className="h-20 rounded-card" />
        </div>
        <Skeleton className="h-32 w-full rounded-card" />
      </div>
    );
  }

  if (!dbContact) {
    return (
      <div className="w-full max-w-2xl mx-auto px-4 py-4 md:py-6 space-y-4">
        <ScreenHeader title="" onBack={() => router.push('/people')} />
        <EmptyState
          icon={<IconUserX size={26} />}
          title="Contact not found"
          description="The contact you are looking for does not exist or has been removed."
          primaryAction={{
            label: 'Back to People',
            onClick: () => router.push('/people'),
          }}
        />
      </div>
    );
  }

  // Format contact for compatibility with sheets
  const contactForSheets: ContactData = {
    id: dbContact.id,
    name: dbContact.name,
    title: dbContact.role,
    company: dbContact.company,
    location: dbContact.address,
    phone: dbContact.phone,
    email: dbContact.email,
    category: dbContact.tags?.[0] || 'Contact',
    howMet: dbContact.met_where,
    tags: dbContact.tags || [],
    summary: dbContact.ai_summary,
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 md:py-6">
      <ScreenHeader
        title=""
        onBack={() => router.push('/people')}
        rightAction={
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center text-textSecondary hover:text-text transition-colors shadow-xs"
              aria-label="Share contact"
              onClick={() => setShareOpen(true)}
            >
              <IconShare size={18} />
            </button>
            <button
              type="button"
              className="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center text-textSecondary hover:text-text transition-colors shadow-xs"
              aria-label="More options"
              onClick={() => setMoreMenuOpen(true)}
            >
              <IconDotsVertical size={18} />
            </button>
          </div>
        }
      />

      <ContactProfileView
        contact={dbContact}
        isStandalonePage
        onEdit={() => router.push(`/people/${dbContact.id}/edit`)}
      />

      <ShareContactSheet
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        contact={contactForSheets}
      />

      <ContactMoreMenuSheet
        isOpen={moreMenuOpen}
        onClose={() => setMoreMenuOpen(false)}
        contact={contactForSheets}
        onDelete={handleDeleteContact}
        onCategoryChanged={(newCat) => {
          setToastMessage(`Updated category to ${newCat}`);
          setToastVisible(true);
        }}
      />

      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        actionText={lastDeletedId ? 'Undo' : 'Close'}
        onAction={lastDeletedId ? handleUndoDelete : () => setToastVisible(false)}
      />
    </div>
  );
}
