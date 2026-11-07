'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  IconPlus,
  IconCheck,
  IconBell,
  IconUser,
  IconDotsVertical,
  IconTrash,
  IconNotebook,
} from '@tabler/icons-react';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { OrangeCorner } from '@/components/ui/OrangeCorner';
import { Chip } from '@/components/ui/Chip';
import { Button } from '@/components/ui/Button';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Toggle } from '@/components/ui/Toggle';
import { Toast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import {
  useNotes,
  useReminders,
  useCreateNote,
  useCompleteReminder,
  useDeleteNote,
  useContacts,
} from '@recallr/api';
import { Note } from '@recallr/core';

function NotesContent() {
  const searchParams = useSearchParams();

  const [activeFilter, setActiveFilter] = useState<'all' | 'reminders' | 'done'>('all');
  const [isEditorOpen, setIsEditorOpen] = useState(searchParams.get('new') === '1');
  const [selectedNoteForMenu, setSelectedNoteForMenu] = useState<Note | null>(null);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // Editor State
  const [noteTitle, setNoteTitle] = useState('');
  const [noteBody, setNoteBody] = useState('');
  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [isReminder, setIsReminder] = useState(searchParams.get('remind') === '1');
  const [reminderOffsetHours, setReminderOffsetHours] = useState(4);

  // Database hooks
  const { data: dbNotes, isLoading: notesLoading } = useNotes();
  const { data: dbReminders, isLoading: remindersLoading } = useReminders();
  const { data: dbContacts } = useContacts();

  const { mutate: createNoteMutate, isPending: isSaving } = useCreateNote();
  const { mutate: completeReminderMutate } = useCompleteReminder();
  const { mutate: deleteNoteMutate } = useDeleteNote();

  const allNotes = dbNotes || [];
  const remindersCount = dbReminders?.length ?? 0;
  const doneNotesCount = useMemo(() => allNotes.filter((n) => !!n.done_at).length, [allNotes]);

  const filteredNotes = useMemo(() => {
    if (activeFilter === 'reminders') {
      return allNotes.filter((n) => !!n.remind_at && !n.done_at);
    }
    if (activeFilter === 'done') {
      return allNotes.filter((n) => !!n.done_at);
    }
    return allNotes;
  }, [allNotes, activeFilter]);

  // Today reminders for hero card
  const todayReminders = useMemo(() => {
    if (!dbReminders) return [];
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    return dbReminders.filter((r) => {
      if (!r.remind_at) return false;
      return new Date(r.remind_at).toISOString().slice(0, 10) === todayStr;
    });
  }, [dbReminders]);

  const toggleComplete = (note: Note) => {
    completeReminderMutate({ id: note.id, contactId: note.contact_id });
    setToastMessage('Reminder marked complete');
    setToastVisible(true);
  };

  const handleDelete = (note: Note) => {
    deleteNoteMutate(note.id);
    setSelectedNoteForMenu(null);
    setToastMessage(`"${note.title || 'Note'}" deleted`);
    setToastVisible(true);
  };

  const handleSaveNote = () => {
    if (!noteTitle.trim() && !noteBody.trim()) {
      setToastMessage('Please enter note title or details');
      setToastVisible(true);
      return;
    }

    const remindAtIso = isReminder
      ? new Date(Date.now() + reminderOffsetHours * 60 * 60 * 1000).toISOString()
      : null;

    createNoteMutate(
      {
        input: {
          title: noteTitle.trim() || undefined,
          body: noteBody.trim() || undefined,
          remind_at: remindAtIso,
          repeat: 'none',
          contact_id: selectedContactId || undefined,
        },
      },
      {
        onSuccess: () => {
          setIsEditorOpen(false);
          setNoteTitle('');
          setNoteBody('');
          setSelectedContactId('');
          setToastMessage('Note saved successfully');
          setToastVisible(true);
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Failed to save note';
          setToastMessage(msg);
          setToastVisible(true);
        },
      }
    );
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 md:py-6 space-y-4">
      {/* Header */}
      <ScreenHeader
        title="Notes & Reminders"
        subtitle={`${allNotes.length} notes, ${remindersCount} reminders scheduled`}
        rightAction={
          <Button
            variant="primary"
            size="sm"
            icon={<IconPlus size={16} />}
            onClick={() => setIsEditorOpen(true)}
          >
            New Note
          </Button>
        }
      />

      {/* Hero Reminders Card */}
      <Card className="relative p-5 bg-white border border-border overflow-hidden">
        <OrangeCorner size="lg">
          <IconBell size={22} stroke={2.2} />
        </OrangeCorner>

        <div className="pr-16">
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-xs font-medium text-accent uppercase tracking-wider">
              Today
            </span>
          </div>

          {remindersLoading ? (
            <Skeleton className="h-10 w-2/3 my-2" />
          ) : todayReminders.length > 0 ? (
            <>
              <h2 className="text-lg font-medium text-text mb-3">
                {todayReminders.length} reminder{todayReminders.length > 1 ? 's' : ''} scheduled today
              </h2>

              <div className="space-y-2.5">
                {todayReminders.map((rem) => {
                  const timeStr = rem.remind_at
                    ? new Date(rem.remind_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '';
                  return (
                    <div
                      key={rem.id}
                      className="flex items-start gap-3 p-2.5 rounded-card bg-bg border border-border/60"
                    >
                      <button
                        type="button"
                        onClick={() => toggleComplete(rem)}
                        className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-colors flex-shrink-0 ${
                          rem.done_at
                            ? 'bg-success border-success text-white'
                            : 'border-borderStrong hover:border-accent'
                        }`}
                      >
                        {rem.done_at && <IconCheck size={12} stroke={3} />}
                      </button>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-xs sm:text-sm font-medium truncate ${
                              rem.done_at ? 'line-through text-textMuted' : 'text-text'
                            }`}
                          >
                            {rem.title || rem.body}
                          </span>
                          {timeStr && (
                            <span className="text-[11px] text-accent font-medium ml-2 flex-shrink-0">
                              {timeStr}
                            </span>
                          )}
                        </div>
                        {rem.body && rem.title && (
                          <p className="text-xs text-textSecondary mt-0.5 leading-snug">
                            {rem.body}
                          </p>
                        )}
                        {rem.contact?.name && (
                          <span className="inline-block mt-1.5 bg-accentTint text-accentDark font-medium text-[10px] px-2 py-0.5 rounded-[4px]">
                            {rem.contact.name}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          ) : (
            <div>
              <h2 className="text-base font-medium text-text mb-1">
                No reminders scheduled today
              </h2>
              <p className="text-xs text-textSecondary">
                All caught up. Tap New Note to schedule follow-ups or save thoughts.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* Filter Chips */}
      <div className="flex items-center gap-2">
        <Chip
          variant={activeFilter === 'all' ? 'selected' : 'default'}
          onClick={() => setActiveFilter('all')}
        >
          All ({allNotes.length})
        </Chip>
        <Chip
          variant={activeFilter === 'reminders' ? 'selected' : 'default'}
          onClick={() => setActiveFilter('reminders')}
        >
          Reminders ({remindersCount})
        </Chip>
        <Chip
          variant={activeFilter === 'done' ? 'selected' : 'default'}
          onClick={() => setActiveFilter('done')}
        >
          Done ({doneNotesCount})
        </Chip>
      </div>

      {/* Notes List */}
      <div className="space-y-2.5">
        {notesLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-24 w-full rounded-card" />
            <Skeleton className="h-24 w-full rounded-card" />
          </div>
        ) : filteredNotes.length === 0 ? (
          <EmptyState
            icon={<IconNotebook size={24} />}
            title="No notes found"
            description="Create your first note to capture conversation takeaways, follow-ups, and meeting context."
            primaryAction={{
              label: 'New Note',
              onClick: () => setIsEditorOpen(true),
            }}
          />
        ) : (
          filteredNotes.map((note) => {
            const dateStr = new Date(note.created_at).toLocaleDateString([], {
              day: 'numeric',
              month: 'short',
            });
            const timeStr = note.remind_at
              ? new Date(note.remind_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : undefined;

            return (
              <Card
                key={note.id}
                className="p-4 bg-white border border-border hover:border-accent/40 transition-colors relative group"
              >
                <div className="flex items-center justify-between text-xs text-textMuted mb-1.5">
                  <span className="font-medium text-accent">{dateStr}</span>
                  <div className="flex items-center gap-2">
                    {timeStr && <span>Reminder: {timeStr}</span>}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNoteForMenu(note);
                      }}
                      className="p-1 rounded text-textMuted hover:text-text hover:bg-black/[0.04]"
                      aria-label="Note options"
                    >
                      <IconDotsVertical size={16} />
                    </button>
                  </div>
                </div>
                {note.title && (
                  <h3 className="text-sm font-medium text-text mb-1">{note.title}</h3>
                )}
                {note.body && (
                  <p className="text-xs sm:text-sm text-textSecondary leading-relaxed mb-2.5">
                    {note.body}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  {note.contact?.name && (
                    <span className="inline-flex items-center gap-1 bg-accentTint text-accentDark text-[11px] font-medium px-2 py-0.5 rounded-[4px]">
                      <IconUser size={12} />
                      <span>{note.contact.name}</span>
                    </span>
                  )}
                  {note.done_at && (
                    <span className="bg-successTint text-success text-[11px] px-2 py-0.5 rounded-[4px] font-medium">
                      Completed
                    </span>
                  )}
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* ================= NEW NOTE DRAWER / MODAL ================= */}
      <BottomSheet
        isOpen={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title="New Note"
        isDesktopDialog
      >
        <div className="space-y-4 pb-4">
          <div>
            <label className="block text-xs text-textSecondary mb-1">Title</label>
            <input
              type="text"
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              placeholder="e.g. Call Ramesh regarding polymer pricing"
              className="w-full h-10 px-3 bg-bg rounded-input border border-border text-sm text-text focus:outline-none focus:border-accent"
            />
          </div>

          <div>
            <label className="block text-xs text-textSecondary mb-1">Note Details</label>
            <textarea
              value={noteBody}
              onChange={(e) => setNoteBody(e.target.value)}
              rows={4}
              placeholder="Type your notes or discussion points..."
              className="w-full p-3 bg-bg rounded-input border border-border text-sm text-text focus:outline-none focus:border-accent resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-textSecondary mb-1">Link to Contact (optional)</label>
            <select
              value={selectedContactId}
              onChange={(e) => setSelectedContactId(e.target.value)}
              className="w-full h-10 px-3 bg-bg rounded-input border border-border text-sm text-text focus:outline-none focus:border-accent"
            >
              <option value="">None (Personal Note)</option>
              {dbContacts?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} {c.company ? `(${c.company})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="pt-2 border-t border-divider">
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-sm font-medium text-text">Remind me</span>
                <p className="text-[11px] text-textSecondary">Set follow-up reminder alert</p>
              </div>
              <Toggle checked={isReminder} onChange={setIsReminder} />
            </div>

            {isReminder && (
              <div className="space-y-3 bg-bg p-3 rounded-card border border-border">
                <div className="flex items-center gap-1.5">
                  {[
                    { label: 'In 2 hours', hours: 2 },
                    { label: 'In 4 hours', hours: 4 },
                    { label: 'Tomorrow', hours: 24 },
                    { label: 'In 3 days', hours: 72 },
                  ].map((item) => (
                    <Chip
                      key={item.label}
                      variant={reminderOffsetHours === item.hours ? 'selected' : 'default'}
                      onClick={() => setReminderOffsetHours(item.hours)}
                    >
                      {item.label}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              disabled={isSaving}
              onClick={handleSaveNote}
              style={{ width: '100%' }}
            >
              {isSaving ? 'Saving...' : 'Save Note'}
            </Button>
          </div>
        </div>
      </BottomSheet>

      {/* Note Options Context Sheet */}
      <BottomSheet
        isOpen={!!selectedNoteForMenu}
        onClose={() => setSelectedNoteForMenu(null)}
        title="Note Options"
      >
        <div className="space-y-1.5 pb-2">
          {selectedNoteForMenu?.remind_at && !selectedNoteForMenu?.done_at && (
            <button
              type="button"
              onClick={() => {
                if (selectedNoteForMenu) toggleComplete(selectedNoteForMenu);
                setSelectedNoteForMenu(null);
              }}
              className="w-full flex items-center gap-3 p-3 rounded-card hover:bg-black/[0.025] text-left text-xs font-medium text-text"
            >
              <IconCheck size={18} className="text-success" />
              <span>Mark as Completed</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (selectedNoteForMenu) handleDelete(selectedNoteForMenu);
            }}
            className="w-full flex items-center gap-3 p-3 rounded-card hover:bg-dangerTint text-left text-xs font-medium text-danger"
          >
            <IconTrash size={18} />
            <span>Delete Note</span>
          </button>
        </div>
      </BottomSheet>

      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        onAction={() => setToastVisible(false)}
      />
    </div>
  );
}

export default function NotesPage() {
  return (
    <Suspense fallback={null}>
      <NotesContent />
    </Suspense>
  );
}
