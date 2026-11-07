'use client';

import React from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ShareContactSheet } from '@/components/people/ShareContactSheet';
import { useContact } from '@recallr/api';
import { Skeleton } from '@/components/ui/Skeleton';

export default function ShareContactClient() {
  const router = useRouter();
  const params = useParams();
  const contactId = params?.id as string;
  const { data: contact, isLoading } = useContact(contactId);

  if (isLoading) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-64 w-full rounded-card" />
      </div>
    );
  }

  if (!contact) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-6 text-center">
        <p className="text-sm text-textSecondary">Contact not found.</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-6">
      <ShareContactSheet
        isOpen={true}
        onClose={() => router.back()}
        contact={contact}
      />
    </div>
  );
}
