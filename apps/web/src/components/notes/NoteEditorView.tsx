'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconBell,
  IconTrash,
  IconUser,
  IconX,
  IconCheck,
} from '@tabler/icons-react';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Chip } from '@/components/ui/Chip';
import { Toggle } from '@/components/ui/Toggle';
import { Toast } from '@/components/ui/Toast';
import { BottomSheet } from '@/components/ui/BottomSheet';
import {
  useContacts,
  useCreateNote,
  useUpdateNote,
  useDeleteNote,
} from '@recallr/api';

export interface NoteEditorViewProps {
  noteId?: string;
  initialTitle?: string;
  initialBody?: string;
  initialContactId?: string;
  initialPersonName?: string;
  initialRemind?: boolean;
  initialRemindAt?: string | null;
  initialRepeat?: 'none' | 'daily' | 'weekly' | 'monthly';
}

export const NoteEditorView: React.FC<NoteEditorViewProps> = ({
  noteId,
  initialTitle = '',
  initialBody = '',
  initialContactId = '',
  initialPersonName = '',
  initialRemind = false,
  initialRemindAt = null,
  initialRepeat = 'none',
}) => {
  const router = useRouter();
  const isEditMode = Boolean(noteId);

  const { data: dbContacts } = useContacts();
  const { mutateAsync: createNoteAsync, isPending: isCreating } = useCreateNote();
  const { mutateAsync: updateNoteAsync, isPending: isUpdating } = useUpdateNote();
  const { mutateAsync: deleteNoteAsync, isPending: isDeleting } = useDeleteNote();

  const [title, setTitle] = useState(initialTitle);
  const [body, setBody] = useState(initialBody);
  const [selectedContactId, setSelectedContactId] = useState(initialContactId);
  const [linkedPersonName, setLinkedPersonName] = useState(initialPersonName);
  const [isReminderOn, setIsReminderOn] = useState(initialRemind || Boolean(initialRemindAt));
  const [quickChip, setQuickChip] = useState<'Tomorrow 9 AM' | 'Later today' | 'Next week'>('Tomorrow 9 AM');
  const [repeat, setRepeat] = useState<'none' | 'daily' | 'weekly' | 'monthly'>(initialRepeat);
  const [isPersonPickerOpen, setIsPersonPickerOpen] = useState(false);
  const [personSearch, setPersonSearch] = useState('');
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // Filter contacts by search
  const filteredContacts = useMemo(() => {
    if (!dbContacts) return [];
    if (!personSearch.trim()) return dbContacts;
    const q = personSearch.toLowerCase();
    return dbContacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q) ||
        c.role?.toLowerCase().includes(q)
    );
  }, [dbContacts, personSearch]);

  const calculateRemindTimestamp = (): string | null => {
    if (!isReminderOn) return null;
    const now = new Date();

    if (quickChip === 'Later today') {
      const later = new Date(now.getTime() + 4 * 60 * 60 * 1000);
      return later.toISOString();
    }
    if (quickChip === 'Next week') {
      const nextWeek = new Date(now);
      nextWeek.setDate(nextWeek.getDate() + 7);
      nextWeek.setHours(9, 0, 0, 0);
      return nextWeek.toISOString();
    }
    // Default: Tomorrow 9 AM
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);
    return tomorrow.toISOString();
  };

  const handleSelectContact = (id: string, name: string) => {
    setSelectedContactId(id);
    setLinkedPersonName(name);
    setIsPersonPickerOpen(false);
  };

  const handleClearContact = () => {
    setSelectedContactId('');
    setLinkedPersonName('');
  };

  const handleSave = async () => {
    if (!title.trim() && !body.trim()) {
      setToastMessage('Please enter note title or body');
      setToastVisible(true);
      return;
    }

    try {
      const remindAt = calculateRemindTimestamp();

      if (isEditMode && noteId) {
        await updateNoteAsync({
          id: noteId,
          input: {
            title: title.trim() || null,
            body: body.trim() || null,
            contact_id: selectedContactId || null,
            remind_at: remindAt,
            repeat,
          },
        });
        setToastMessage('Note updated');
      } else {
        await createNoteAsync({
          input: {
            title: title.trim() || null,
            body: body.trim() || null,
            contact_id: selectedContactId || null,
            remind_at: remindAt,
            repeat,
          },
        });
        setToastMessage('Note created');
      }

      setToastVisible(true);
      setTimeout(() => {
        router.push('/notes');
      }, 600);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to save note';
      setToastMessage(msg);
      setToastVisible(true);
    }
  };

  const handleDelete = async () => {
    if (!noteId) return;
    try {
      await deleteNoteAsync(noteId);
      setToastMessage('Note deleted');
      setToastVisible(true);
      setTimeout(() => {
        router.push('/notes');
      }, 600);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to delete note';
      setToastMessage(msg);
      setToastVisible(true);
    }
  };

  const isSaving = isCreating || isUpdating || isDeleting;

  return (
    <div className="w-full max-w-xl mx-auto px-4 py-4 md:py-6 space-y-4">
      <ScreenHeader
        title={isEditMode ? 'Edit Note' : 'New Note'}
        onBack={() => router.push('/notes')}
        rightAction={
          <Button variant="primary" size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        }
      />

      {/* 1. Title and Body Card */}
      <Card className="bg-white border border-border p-4 space-y-3">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Note title (e.g. Discuss raw materials pricing)"
          className="w-full text-base font-medium text-text bg-transparent placeholder:text-textMuted focus:outline-none"
        />
        <div className="border-t border-divider my-2" />
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={5}
          placeholder="Jot down notes, discussion points, agreements, or context..."
          className="w-full text-sm text-text bg-transparent placeholder:text-textMuted focus:outline-none resize-none leading-relaxed"
        />
      </Card>

      {/* 2. Link to Person */}
      <Card className="p-4 bg-white border border-border">
        <label className="block text-xs font-medium text-textSecondary uppercase tracking-wider mb-2">
          Linked Contact
        </label>
        {linkedPersonName ? (
          <div className="flex items-center justify-between p-2.5 bg-bg rounded-input border border-border">
            <div className="flex items-center gap-2">
              <IconUser size={16} className="text-accent" />
              <span className="text-sm font-medium text-text">{linkedPersonName}</span>
            </div>
            <button
              type="button"
              onClick={handleClearContact}
              className="p-1 text-textMuted hover:text-text"
            >
              <IconX size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setIsPersonPickerOpen(true)}
            className="w-full p-2.5 bg-bg hover:bg-fill/60 border border-dashed border-border rounded-input text-xs text-textSecondary flex items-center justify-center gap-1.5 transition-colors"
          >
            <IconUser size={14} />
            <span>Link to contact in network</span>
          </button>
        )}
      </Card>

      {/* 3. Follow-up Reminder Toggle & Time Selector */}
      <Card className="p-4 bg-white border border-border space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accentTint flex items-center justify-center text-accent">
              <IconBell size={18} />
            </div>
            <div>
              <span className="text-sm font-medium text-text block">Set reminder</span>
              <span className="text-[11px] text-textSecondary">
                Get an alert when it is time to follow up
              </span>
            </div>
          </div>
          <Toggle checked={isReminderOn} onChange={setIsReminderOn} />
        </div>

        {isReminderOn && (
          <div className="pt-2 border-t border-divider space-y-3">
            <label className="block text-xs text-textSecondary">Reminder time</label>
            <div className="flex flex-wrap gap-2">
              {(['Tomorrow 9 AM', 'Later today', 'Next week'] as const).map((chip) => (
                <Chip
                  key={chip}
                  variant={quickChip === chip ? 'selected' : 'default'}
                  onClick={() => setQuickChip(chip)}
                >
                  {chip}
                </Chip>
              ))}
            </div>

            <div className="pt-2">
              <label className="block text-xs text-textSecondary mb-1.5">Repeat cadence</label>
              <div className="flex flex-wrap gap-2">
                {(['none', 'daily', 'weekly', 'monthly'] as const).map((r) => (
                  <Chip
                    key={r}
                    variant={repeat === r ? 'selected' : 'default'}
                    onClick={() => setRepeat(r)}
                  >
                    {r === 'none' ? 'Does not repeat' : r.charAt(0).toUpperCase() + r.slice(1)}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Delete Button (Edit mode only) */}
      {isEditMode && (
        <div className="pt-2">
          <Button
            variant="danger"
            size="md"
            icon={<IconTrash size={16} />}
            onClick={handleDelete}
            disabled={isSaving}
            className="w-full"
          >
            Delete Note
          </Button>
        </div>
      )}

      {/* Contact Picker Sheet */}
      <BottomSheet
        isOpen={isPersonPickerOpen}
        onClose={() => setIsPersonPickerOpen(false)}
        title="Link to Contact"
      >
        <div className="p-4 space-y-3 max-h-[60vh] flex flex-col">
          <input
            type="text"
            value={personSearch}
            onChange={(e) => setPersonSearch(e.target.value)}
            placeholder="Search contacts..."
            className="w-full h-10 px-3 bg-bg rounded-input border border-border text-sm text-text focus:outline-none focus:border-accent"
          />

          <div className="overflow-y-auto space-y-1 flex-1 divide-y divide-divider">
            {filteredContacts.length === 0 ? (
              <p className="text-xs text-textSecondary text-center py-6">
                No contacts match your query.
              </p>
            ) : (
              filteredContacts.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => handleSelectContact(c.id, c.name)}
                  className="w-full py-2.5 px-2 text-left hover:bg-bg rounded flex items-center justify-between transition-colors"
                >
                  <div>
                    <span className="text-sm font-medium text-text block">{c.name}</span>
                    {c.company && (
                      <span className="text-xs text-textSecondary">{c.company}</span>
                    )}
                  </div>
                  {selectedContactId === c.id && <IconCheck size={16} className="text-accent" />}
                </button>
              ))
            )}
          </div>
        </div>
      </BottomSheet>

      <Toast
        message={toastMessage}
        isVisible={toastVisible}
        actionText="Close"
        onAction={() => setToastVisible(false)}
      />
    </div>
  );
};
