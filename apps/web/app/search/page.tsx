'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IconArrowUpRight,
  IconSparkles,
  IconSearch,
  IconFolder,
} from '@tabler/icons-react';
import { SearchBar } from '@/components/ui/SearchBar';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Chip } from '@/components/ui/Chip';
import { EmptyState } from '@/components/ui/EmptyState';
import { Skeleton } from '@/components/ui/Skeleton';
import { useCategories, useContacts, useNotes } from '@recallr/api';

const normalizeSearchText = (value: string) =>
  value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase();

export default function GlobalSearchPage() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'people' | 'notes' | 'categories'>('all');

  const { data: dbContacts, isLoading: isContactsLoading } = useContacts({
    query: query.trim() || undefined,
  });
  const { data: allContacts } = useContacts();
  const { data: dbNotes, isLoading: isNotesLoading } = useNotes();
  const { data: dbCategories, isLoading: isCategoriesLoading } = useCategories();

  const highlightMatch = (text?: string | null, target?: string) => {
    if (!text) return '';
    if (!target || !target.trim()) return text;
    const safeTarget = target.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${safeTarget})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      normalizeSearchText(part) === normalizeSearchText(target) ? (
        <span key={i} className="bg-accentTint text-accent font-medium px-0.5 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const peopleResults = useMemo(() => {
    if (!query.trim()) return dbContacts || [];
    return dbContacts || [];
  }, [dbContacts, query]);

  const noteResults = useMemo(() => {
    if (!dbNotes) return [];
    if (!query.trim()) return dbNotes;
    const q = normalizeSearchText(query);
    return dbNotes.filter(
      (n) =>
        normalizeSearchText(n.title || '').includes(q) ||
        normalizeSearchText(n.body || '').includes(q) ||
        normalizeSearchText(n.contact?.name || '').includes(q)
    );
  }, [dbNotes, query]);

  const categoryResults = useMemo(() => {
    if (!dbCategories || !query.trim()) return [];
    const q = normalizeSearchText(query);
    return dbCategories.filter((category) => normalizeSearchText(category.name).includes(q));
  }, [dbCategories, query]);

  const totalResults = peopleResults.length + noteResults.length + categoryResults.length;

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 md:py-6 space-y-4">
      {/* Top Search Input */}
      <SearchBar
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onClear={() => setQuery('')}
        placeholder="Search name, company, note, category..."
        autoFocus
        focusedBorder
      />

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        <Chip
          variant={activeTab === 'all' ? 'selected' : 'default'}
          onClick={() => setActiveTab('all')}
        >
          All ({totalResults})
        </Chip>
        <Chip
          variant={activeTab === 'people' ? 'selected' : 'default'}
          onClick={() => setActiveTab('people')}
        >
          People ({peopleResults.length})
        </Chip>
        <Chip
          variant={activeTab === 'notes' ? 'selected' : 'default'}
          onClick={() => setActiveTab('notes')}
        >
          Notes ({noteResults.length})
        </Chip>
        <Chip
          variant={activeTab === 'categories' ? 'selected' : 'default'}
          onClick={() => setActiveTab('categories')}
        >
          Categories ({categoryResults.length})
        </Chip>
      </div>

      {/* Ask Recallr Prompt Card */}
      {query.trim() && (
        <Card
          onClick={() => router.push(`/ask?q=${encodeURIComponent(query)}`)}
          className="p-3.5 bg-accentTintSoft border border-accent/20 cursor-pointer hover:border-accent/50 transition-colors flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-accentTint flex items-center justify-center text-accent">
              <IconSparkles size={18} />
            </div>
            <div>
              <span className="text-xs font-medium text-text">
                Ask Recallr about &ldquo;{query}&rdquo;
              </span>
              <p className="text-[11px] text-textSecondary">
                Let AI search all notes, meetings, and conversation memories
              </p>
            </div>
          </div>
          <IconArrowUpRight size={16} className="text-accent" />
        </Card>
      )}

      {isContactsLoading || isNotesLoading || isCategoriesLoading ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full rounded-card" />
          <Skeleton className="h-16 w-full rounded-card" />
        </div>
      ) : totalResults === 0 ? (
        <EmptyState
          icon={<IconSearch size={24} />}
          title="No results found"
          description={
            query
              ? `No contacts, notes, or categories match "${query}". Try another search term.`
              : 'Search through your contacts, companies, notes, categories, and reminders.'
          }
        />
      ) : (
        <>
          {/* ================= PEOPLE RESULTS ================= */}
          {(activeTab === 'all' || activeTab === 'people') && peopleResults.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-textSecondary uppercase tracking-wider mb-2 px-1">
                People ({peopleResults.length})
              </h3>
              <Card className="bg-white border border-border divide-y divide-divider overflow-hidden">
                {peopleResults.map((person) => (
                  <Link
                    key={person.id}
                    href={`/people/${person.id}`}
                    className="p-3 flex items-center justify-between hover:bg-black/[0.015] transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar name={person.name} size="sm" />
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-text truncate">
                          {highlightMatch(person.name, query)}
                        </div>
                        <div className="text-[11px] text-textSecondary truncate">
                          {highlightMatch(
                            `${person.role || ''}${person.role && person.company ? ' • ' : ''}${person.company || person.address || ''}`,
                            query
                          )}
                        </div>
                      </div>
                    </div>
                    {person.tags?.[0] && (
                      <span className="bg-accentTint text-accentDark font-medium text-[10px] px-2 py-0.5 rounded-[4px] flex-shrink-0 ml-2">
                        {person.tags[0]}
                      </span>
                    )}
                  </Link>
                ))}
              </Card>
            </div>
          )}

          {/* ================= NOTES RESULTS ================= */}
          {(activeTab === 'all' || activeTab === 'notes') && noteResults.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-textSecondary uppercase tracking-wider mb-2 px-1">
                Notes ({noteResults.length})
              </h3>
              <div className="space-y-2">
                {noteResults.map((note) => {
                  const dateStr = new Date(note.created_at).toLocaleDateString([], {
                    day: 'numeric',
                    month: 'short',
                  });
                  return (
                    <Card
                      key={note.id}
                      onClick={() => router.push('/notes')}
                      className="p-3.5 bg-white border border-border hover:border-accent/40 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between text-[11px] text-textMuted mb-1">
                        <span className="font-medium text-text">
                          {highlightMatch(note.title || 'Note', query)}
                        </span>
                        <span>{dateStr}</span>
                      </div>
                      {note.body && (
                        <p className="text-xs text-textSecondary leading-relaxed">
                          {highlightMatch(note.body, query)}
                        </p>
                      )}
                      {note.contact?.name && (
                        <span className="inline-block mt-1 text-[10px] text-accent font-medium">
                          {note.contact.name}
                        </span>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {(activeTab === 'all' || activeTab === 'categories') && categoryResults.length > 0 && (
            <div>
              <h3 className="text-xs font-medium text-textSecondary uppercase tracking-wider mb-2 px-1">
                Categories ({categoryResults.length})
              </h3>
              <Card className="bg-white border border-border divide-y divide-divider overflow-hidden">
                {categoryResults.map((category) => {
                  const count = allContacts?.filter((person) => person.category_ids?.includes(category.id)).length ?? 0;
                  return (
                    <Link key={category.id} href={`/categories/${category.id}`} className="p-3 flex items-center justify-between hover:bg-black/[0.015] transition-colors">
                      <span className="flex items-center gap-3 text-sm font-medium text-text">
                        <IconFolder size={18} className="text-accent" />
                        {highlightMatch(category.name, query)}
                      </span>
                      <span className="text-xs text-textSecondary">{count}</span>
                    </Link>
                  );
                })}
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
