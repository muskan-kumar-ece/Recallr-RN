'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IconPlus,
  IconArrowsUpDown,
  IconUserX,
} from '@tabler/icons-react';
import { SearchBar } from '@/components/ui/SearchBar';
import { Chip } from '@/components/ui/Chip';
import { ListRow } from '@/components/ui/ListRow';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { ContactProfileView } from '@/components/people/ContactProfileView';
import { useContacts, useCategories, useUserSettings } from '@recallr/api';
import { isFollowUpDue } from '@recallr/core';

export default function PeoplePage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('all');
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);

  const { data: dbContacts, isLoading: contactsLoading } = useContacts({
    query: search.trim() ? search.trim() : undefined,
  });
  const { data: dbCategories, isLoading: categoriesLoading } = useCategories();
  const { data: userSettings } = useUserSettings();

  // Filter contacts by selected category
  const filteredContacts = useMemo(() => {
    if (!dbContacts) return [];
    if (selectedCategoryId === 'all') return dbContacts;
    return dbContacts.filter((c) => c.category_ids?.includes(selectedCategoryId));
  }, [dbContacts, selectedCategoryId]);

  // Group contacts alphabetically
  const groupedContacts = useMemo(() => {
    const map: Record<string, typeof filteredContacts> = {};
    for (const c of filteredContacts) {
      const firstChar = (c.name[0] || '#').toUpperCase();
      const letter = /[A-Z]/.test(firstChar) ? firstChar : '#';
      if (!map[letter]) map[letter] = [];
      map[letter].push(c);
    }
    return map;
  }, [filteredContacts]);

  const alphabet = useMemo(() => Object.keys(groupedContacts).sort(), [groupedContacts]);

  // Selected contact object for desktop right pane
  const activeContact = useMemo(() => {
    if (!filteredContacts || filteredContacts.length === 0) return null;
    if (selectedContactId) {
      const match = filteredContacts.find((c) => c.id === selectedContactId);
      if (match) return match;
    }
    return filteredContacts[0];
  }, [filteredContacts, selectedContactId]);

  const handleContactClick = (id: string) => {
    setSelectedContactId(id);
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      router.push(`/people/${id}`);
    }
  };

  const totalContactsCount = dbContacts?.length ?? 0;
  const totalCategoriesCount = dbCategories?.length ?? 0;

  return (
    <div className="w-full max-w-[1100px] mx-auto px-4 py-4 md:py-6">
      {/* DESKTOP SPLIT VIEW OR MOBILE SINGLE COLUMN */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* ================= LEFT PANE: CONTACTS LIST ================= */}
        <div className="w-full md:w-[380px] flex-shrink-0 space-y-3">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-medium text-text">People</h1>
              <p className="text-xs text-textSecondary">
                {contactsLoading
                  ? 'Loading contacts...'
                  : `${totalContactsCount} contacts in ${totalCategoriesCount} categories`}
              </p>
            </div>
            <Link
              href="/people/new"
              className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accentPressed transition-colors shadow-xs"
              aria-label="Add contact"
            >
              <IconPlus size={20} />
            </Link>
          </div>

          {/* SearchBar */}
          <SearchBar
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onClear={() => setSearch('')}
            placeholder="Search name, company, note..."
          />

          {/* Category Filter Chips (Horizontal Scroll) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none select-none">
            <Chip
              variant={selectedCategoryId === 'all' ? 'selected' : 'default'}
              onClick={() => setSelectedCategoryId('all')}
              className="whitespace-nowrap"
            >
              All ({totalContactsCount})
            </Chip>
            {!categoriesLoading &&
              dbCategories?.map((cat) => (
                <Chip
                  key={cat.id}
                  variant={selectedCategoryId === cat.id ? 'selected' : 'default'}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className="whitespace-nowrap"
                >
                  {cat.name} ({cat.count ?? 0})
                </Chip>
              ))}
          </div>

          {/* Sort & Filter Controls */}
          <div className="flex items-center justify-between text-xs text-textSecondary px-1 pt-1 border-t border-divider">
            <span className="font-medium">Sorting by A to Z</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                className="hover:text-text flex items-center gap-1"
              >
                <IconArrowsUpDown size={14} />
                <span>Sort</span>
              </button>
            </div>
          </div>

          {/* Grouped Contact List */}
          <div className="relative bg-white rounded-card border border-border overflow-hidden">
            {/* Alphabet strip index on right */}
            {alphabet.length > 0 && (
              <div className="absolute right-1 top-2 bottom-2 z-10 flex flex-col justify-between items-center text-[10px] text-textMuted font-medium select-none pointer-events-none py-1">
                {alphabet.map((letter) => (
                  <span key={letter}>{letter}</span>
                ))}
              </div>
            )}

            <div className="divide-y divide-divider max-h-[calc(100vh-280px)] overflow-y-auto pr-5">
              {contactsLoading ? (
                <div className="p-2 space-y-2">
                  <Skeleton variant="row" />
                  <Skeleton variant="row" />
                  <Skeleton variant="row" />
                  <Skeleton variant="row" />
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-10 h-10 rounded-full bg-fill flex items-center justify-center mx-auto mb-2 text-textMuted">
                    <IconUserX size={20} />
                  </div>
                  <p className="text-xs font-medium text-text">
                    {search ? 'No contacts match your search' : 'No contacts yet'}
                  </p>
                  <p className="text-[11px] text-textSecondary mt-1">
                    {search
                      ? 'Try another keyword or clear the search filter'
                      : 'Add your first contact to start building your personal CRM.'}
                  </p>
                  {!search && (
                    <button
                      type="button"
                      onClick={() => router.push('/people/new')}
                      className="mt-3 px-3 py-1.5 rounded-button bg-accent text-white text-xs font-medium hover:bg-accentPressed transition-colors"
                    >
                      Add Contact
                    </button>
                  )}
                </div>
              ) : (
                alphabet.map((letter) => {
                  const list = groupedContacts[letter] || [];
                  return (
                    <div key={letter}>
                      <div className="px-3.5 py-1.5 bg-bg/80 text-[11px] font-medium text-accent uppercase tracking-wider sticky top-0 z-10 backdrop-blur-xs">
                        {letter}
                      </div>
                      {list.map((contact) => {
                        const isSelected = activeContact?.id === contact.id;
                        const due = isFollowUpDue(
                          {
                            deleted_at: contact.deleted_at,
                            last_contacted_at: contact.last_contacted_at,
                            created_at: contact.created_at,
                          },
                          userSettings?.nudge_days ?? 30,
                          new Date(),
                          userSettings?.nudges_enabled ?? true
                        );

                        return (
                          <div
                            key={contact.id}
                            onClick={() => handleContactClick(contact.id)}
                            className={`cursor-pointer transition-colors ${
                              isSelected
                                ? 'bg-accentTintSoft'
                                : 'hover:bg-black/[0.015]'
                            }`}
                          >
                            <ListRow
                              leading={<Avatar name={contact.name} size="sm" />}
                              title={contact.name}
                              subtitle={
                                contact.company && contact.address
                                  ? `${contact.company} • ${contact.address}`
                                  : contact.company || contact.role || contact.address || 'Contact'
                              }
                              followUpDue={due}
                              tag={contact.tags?.[0]}
                              showDivider={false}
                            />
                          </div>
                        );
                      })}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ================= RIGHT PANE: SELECTED PROFILE (DESKTOP) ================= */}
        <div className="hidden md:block flex-1 min-w-0 sticky top-20">
          {activeContact ? (
            <ContactProfileView
              contact={activeContact}
              onEdit={() => router.push(`/people/${activeContact.id}/edit`)}
            />
          ) : (
            <div className="p-12 text-center bg-white rounded-card border border-border">
              <p className="text-sm font-medium text-text">No contact selected</p>
              <p className="text-xs text-textSecondary mt-1">
                Select a contact from the list or create a new one.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
