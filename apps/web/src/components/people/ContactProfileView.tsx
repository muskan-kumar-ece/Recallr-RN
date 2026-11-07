'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IconPencil,
  IconPhone,
  IconBrandWhatsapp,
  IconMail,
  IconBell,
  IconSparkles,
  IconClock,
  IconBuilding,
  IconMapPin,
  IconCalendar,
  IconArrowUp,
  IconCheck,
} from '@tabler/icons-react';
import { Card } from '@/components/ui/Card';
import { OrangeCorner } from '@/components/ui/OrangeCorner';
import { Avatar } from '@/components/ui/Avatar';
import { FieldRow } from '@/components/ui/FieldRow';
import { useNotes, useCompleteReminder } from '@recallr/api';
import { Contact } from '@recallr/core';

export interface ContactData {
  id: string;
  name: string;
  title?: string | null;
  role?: string | null;
  company?: string | null;
  location?: string | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  category?: string | null;
  howMet?: string | null;
  met_where?: string | null;
  tags?: string[];
  summary?: string | null;
  ai_summary?: string | null;
  nextFollowUp?: {
    date: string;
    time: string;
    note: string;
  };
  notes?: Array<{
    id: string;
    date: string;
    text: string;
  }>;
  documents?: Array<{
    id: string;
    title: string;
    size: string;
    type: 'pdf' | 'card';
  }>;
}

export interface ContactProfileViewProps {
  contact?: Contact | ContactData | null;
  onEdit?: () => void;
  isStandalonePage?: boolean;
}

export const ContactProfileView: React.FC<ContactProfileViewProps> = ({
  contact,
  onEdit,
  isStandalonePage: _isStandalonePage = false,
}) => {
  const router = useRouter();
  const [askInput, setAskInput] = React.useState('');
  const contactId = contact?.id || '';
  const { data: dbNotes } = useNotes(contactId);
  const { mutate: completeReminderMutate } = useCompleteReminder();

  if (!contact) {
    return (
      <Card className="p-8 bg-white border border-border text-center">
        <p className="text-sm text-textSecondary">Select a contact to view their profile details.</p>
      </Card>
    );
  }

  const title = ('role' in contact && contact.role) || ('title' in contact && contact.title) || '';
  const company = contact.company || '';
  const location = ('address' in contact && contact.address) || ('location' in contact && contact.location) || '';
  const howMet = ('met_where' in contact && contact.met_where) || ('howMet' in contact && contact.howMet) || '';
  const summary = contact.ai_summary || ('summary' in contact && contact.summary) || '';
  const tags = contact.tags || [];

  // Determine next follow-up from real notes
  const activeReminder = React.useMemo(() => {
    if (!dbNotes) return null;
    return dbNotes.find((n) => n.remind_at && !n.done_at);
  }, [dbNotes]);

  const handleAskSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!askInput.trim()) return;
    router.push(`/ask?q=${encodeURIComponent(`About ${contact.name}: ${askInput}`)}`);
  };

  const handleCompleteReminder = (reminderId: string) => {
    completeReminderMutate({ id: reminderId, contactId: contact.id });
  };

  return (
    <div className="w-full space-y-4">
      {/* ================= 1. HEADER CARD WITH ORANGE CORNER ================= */}
      <Card className="relative p-5 bg-white border border-border overflow-hidden">
        <OrangeCorner
          size="md"
          onClick={onEdit || (() => router.push(`/people/${contact.id}/edit`))}
          title="Edit Contact"
        >
          <IconPencil size={18} stroke={2.2} />
        </OrangeCorner>

        <div className="flex items-start gap-4 pr-14">
          <Avatar name={contact.name} size="lg" />
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-medium text-text truncate">
              {contact.name}
            </h1>
            {(title || company) && (
              <p className="text-xs sm:text-sm text-textSecondary font-normal mt-0.5 truncate">
                {title} {title && company ? '•' : ''} {company}
              </p>
            )}
            {location && (
              <div className="flex items-center gap-1.5 text-xs text-textMuted mt-1">
                <IconMapPin size={14} className="text-textMuted flex-shrink-0" />
                <span className="truncate">{location}</span>
              </div>
            )}
            {tags.length > 0 && (
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="bg-fill text-textSecondary text-[11px] px-2 py-0.5 rounded-[6px]"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* ================= 2. QUICK ACTION CARDS (4-COL) ================= */}
      <div className="grid grid-cols-4 gap-2.5">
        {contact.phone ? (
          <a
            href={`tel:${contact.phone}`}
            className="flex flex-col items-center justify-center p-3 rounded-card bg-white border border-border hover:border-accent/40 hover:bg-accentTintSoft transition-all group shadow-xs"
          >
            <div className="w-10 h-10 rounded-[12px] bg-accentTint text-accent flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <IconPhone size={20} />
            </div>
            <span className="text-xs font-medium text-text">Call</span>
          </a>
        ) : (
          <div className="flex flex-col items-center justify-center p-3 rounded-card bg-white/60 border border-border opacity-50">
            <div className="w-10 h-10 rounded-[12px] bg-fill text-textMuted flex items-center justify-center mb-1">
              <IconPhone size={20} />
            </div>
            <span className="text-xs font-medium text-textMuted">Call</span>
          </div>
        )}

        {contact.phone ? (
          <a
            href={`https://wa.me/${contact.phone.replace(/[^0-9]/g, '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-3 rounded-card bg-white border border-border hover:border-accent/40 hover:bg-accentTintSoft transition-all group shadow-xs"
          >
            <div className="w-10 h-10 rounded-[12px] bg-accentTint text-accent flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <IconBrandWhatsapp size={20} />
            </div>
            <span className="text-xs font-medium text-text">WhatsApp</span>
          </a>
        ) : (
          <div className="flex flex-col items-center justify-center p-3 rounded-card bg-white/60 border border-border opacity-50">
            <div className="w-10 h-10 rounded-[12px] bg-fill text-textMuted flex items-center justify-center mb-1">
              <IconBrandWhatsapp size={20} />
            </div>
            <span className="text-xs font-medium text-textMuted">WhatsApp</span>
          </div>
        )}

        {contact.email ? (
          <a
            href={`mailto:${contact.email}`}
            className="flex flex-col items-center justify-center p-3 rounded-card bg-white border border-border hover:border-accent/40 hover:bg-accentTintSoft transition-all group shadow-xs"
          >
            <div className="w-10 h-10 rounded-[12px] bg-accentTint text-accent flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
              <IconMail size={20} />
            </div>
            <span className="text-xs font-medium text-text">Email</span>
          </a>
        ) : (
          <div className="flex flex-col items-center justify-center p-3 rounded-card bg-white/60 border border-border opacity-50">
            <div className="w-10 h-10 rounded-[12px] bg-fill text-textMuted flex items-center justify-center mb-1">
              <IconMail size={20} />
            </div>
            <span className="text-xs font-medium text-textMuted">Email</span>
          </div>
        )}

        <button
          type="button"
          onClick={() => router.push(`/notes?person=${encodeURIComponent(contact.name)}&new=1&remind=1`)}
          className="flex flex-col items-center justify-center p-3 rounded-card bg-white border border-border hover:border-accent/40 hover:bg-accentTintSoft transition-all group shadow-xs"
        >
          <div className="w-10 h-10 rounded-[12px] bg-accentTint text-accent flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
            <IconBell size={20} />
          </div>
          <span className="text-xs font-medium text-text">Remind</span>
        </button>
      </div>

      {/* ================= 3. RECALLR AI SUMMARY CARD ================= */}
      {summary ? (
        <Card className="relative p-4 sm:p-5 bg-white border border-border overflow-hidden">
          <OrangeCorner size="md" title="AI summary">
            <IconSparkles size={18} stroke={2.2} />
          </OrangeCorner>

          <div className="pr-14">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-6 h-6 rounded-md bg-accentTint flex items-center justify-center text-accent">
                <IconSparkles size={15} />
              </div>
              <span className="text-xs font-medium text-text">Recallr Summary</span>
            </div>

            <p className="text-xs sm:text-sm text-text font-normal leading-relaxed">
              {summary}
            </p>
          </div>
        </Card>
      ) : null}

      {/* ================= 4. NEXT FOLLOW-UP CARD ================= */}
      {activeReminder && (
        <Card className="relative p-4 sm:p-5 border bg-white border-border hover:border-accent/40 transition-all overflow-hidden">
          <OrangeCorner size="md">
            <IconClock size={18} stroke={2.2} />
          </OrangeCorner>

          <div className="pr-14">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-accent" />
              <span className="text-xs font-medium text-accent">
                Next Follow-up •{' '}
                {activeReminder.remind_at
                  ? new Date(activeReminder.remind_at).toLocaleDateString([], {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })
                  : 'Scheduled'}
              </span>
            </div>

            <p className="text-xs sm:text-sm text-text font-normal leading-relaxed mb-3">
              {activeReminder.title || activeReminder.body || 'Follow-up reminder'}
            </p>

            <button
              type="button"
              onClick={() => handleCompleteReminder(activeReminder.id)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-fill hover:bg-black/[0.08] text-text transition-colors"
            >
              <IconCheck size={14} />
              <span>Mark as done</span>
            </button>
          </div>
        </Card>
      )}

      {/* ================= 5. CONTACT DETAILS ================= */}
      <div>
        <h3 className="text-xs font-medium text-textSecondary uppercase tracking-wider mb-2 px-1">
          Contact Details
        </h3>
        <Card className="bg-white border border-border divide-y divide-divider overflow-hidden">
          {contact.phone && <FieldRow label="Phone" value={contact.phone} icon={<IconPhone size={15} />} />}
          {contact.email && <FieldRow label="Email" value={contact.email} icon={<IconMail size={15} />} />}
          {company && <FieldRow label="Company" value={company} icon={<IconBuilding size={15} />} />}
          {howMet && <FieldRow label="How you met" value={howMet} icon={<IconCalendar size={15} />} />}
          {location && <FieldRow label="Location" value={location} icon={<IconMapPin size={15} />} />}
        </Card>
      </div>

      {/* ================= 6. NOTES ================= */}
      <div>
        <div className="flex items-center justify-between mb-2 px-1">
          <h3 className="text-xs font-medium text-textSecondary uppercase tracking-wider">
            Notes ({dbNotes?.length ?? 0})
          </h3>
          <Link
            href={`/notes?person=${encodeURIComponent(contact.name)}&new=1`}
            className="text-xs text-accent font-medium hover:underline"
          >
            + Add Note
          </Link>
        </div>

        <div className="space-y-2">
          {dbNotes && dbNotes.length > 0 ? (
            dbNotes.map((note) => (
              <Card key={note.id} className="p-3.5 bg-white border border-border">
                <div className="flex items-center justify-between text-[11px] text-textMuted mb-1">
                  <span>
                    {new Date(note.created_at).toLocaleDateString([], {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  {note.remind_at && (
                    <span className="text-accent font-medium">
                      Reminder:{' '}
                      {new Date(note.remind_at).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  )}
                </div>
                {note.title && <div className="text-xs font-medium text-text mb-0.5">{note.title}</div>}
                {note.body && <p className="text-xs sm:text-sm text-textSecondary leading-relaxed">{note.body}</p>}
              </Card>
            ))
          ) : (
            <Card className="p-4 bg-white border border-border text-center">
              <p className="text-xs text-textSecondary">No notes recorded yet.</p>
            </Card>
          )}
        </div>
      </div>

      {/* ================= 7. BOTTOM "ASK ABOUT PERSON" BAR ================= */}
      <div className="pt-2">
        <form
          onSubmit={handleAskSubmit}
          className="relative flex items-center bg-white rounded-card border border-border p-1.5 shadow-xs focus-within:border-accent transition-colors"
        >
          <input
            type="text"
            value={askInput}
            onChange={(e) => setAskInput(e.target.value)}
            placeholder={`Ask anything about ${contact.name.split(' ')[0]}...`}
            className="flex-1 px-3 py-2 bg-transparent text-xs sm:text-sm text-text placeholder:text-textMuted focus:outline-none min-w-0"
          />
          <button
            type="submit"
            className="w-8 h-8 rounded-[10px] bg-accent text-white flex items-center justify-center hover:bg-accentPressed transition-colors flex-shrink-0"
            aria-label="Send"
          >
            <IconArrowUp size={16} />
          </button>
        </form>
      </div>
    </div>
  );
};
