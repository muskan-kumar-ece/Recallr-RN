'use client';

import React, { useMemo } from 'react';
import { NoteEditorView } from '@/components/notes/NoteEditorView';
import { useNotes, useContacts } from '@recallr/api';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useRouteParam } from '@/hooks/useRouteParam';

export default function EditNoteClient() {
  const noteId = useRouteParam('id');

  const { data: notes, isLoading } = useNotes();
  const { data: contacts } = useContacts();

  const note = useMemo(() => {
    return notes?.find((n) => n.id === noteId);
  }, [notes, noteId]);

  const contactName = useMemo(() => {
    if (!note?.contact_id || !contacts) return '';
    return contacts.find((c) => c.id === note.contact_id)?.name || '';
  }, [note, contacts]);

  if (isLoading) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-6 space-y-4">
        <Skeleton className="h-10 w-44 rounded" />
        <Skeleton className="h-44 w-full rounded-card" />
        <Skeleton className="h-28 w-full rounded-card" />
      </div>
    );
  }

  if (!note) {
    return (
      <div className="w-full max-w-xl mx-auto px-4 py-8 text-center">
        <EmptyState
          title="Note Not Found"
          description="The note you are looking for does not exist or has been deleted."
        />
      </div>
    );
  }

  return (
    <NoteEditorView
      noteId={note.id}
      initialTitle={note.title || ''}
      initialBody={note.body || ''}
      initialContactId={note.contact_id || ''}
      initialPersonName={contactName}
      initialRemind={Boolean(note.remind_at)}
      initialRemindAt={note.remind_at}
      initialRepeat={note.repeat || 'none'}
    />
  );
}
