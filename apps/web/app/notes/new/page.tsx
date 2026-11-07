'use client';

import React, { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { NoteEditorView } from '@/components/notes/NoteEditorView';

function NewNoteContent() {
  const searchParams = useSearchParams();
  const contact = searchParams.get('contact') || searchParams.get('person') || '';
  const remind = searchParams.get('remind') === '1';

  return (
    <NoteEditorView
      initialPersonName={contact}
      initialContactId={contact}
      initialRemind={remind}
    />
  );
}

export default function NewNotePage() {
  return (
    <Suspense fallback={null}>
      <NewNoteContent />
    </Suspense>
  );
}
