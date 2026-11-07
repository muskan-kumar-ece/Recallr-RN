'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  IconSearch,
  IconArrowUpRight,
  IconScan,
  IconUserPlus,
  IconNotebook,
  IconId,
  IconSparkles,
  IconPhone,
  IconBrandWhatsapp,
  IconPlus,
  IconSettings,
  IconCrown,
  IconCheck,
} from '@tabler/icons-react';
import { Card } from '@/components/ui/Card';
import { OrangeCorner } from '@/components/ui/OrangeCorner';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  useCategories,
  useReminders,
  useContacts,
  useUserSettings,
  useEntitlements,
  useProfile,
} from '@recallr/api';
import { useRecallrAuth } from '@/providers/RecallrProvider';
import { isFollowUpDue } from '@recallr/core';

export default function HomePage() {
  const router = useRouter();
  const { user } = useRecallrAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: userSettings } = useUserSettings();
  const { data: entitlements } = useEntitlements();
  const { data: dbCategories, isLoading: categoriesLoading } = useCategories();
  const { data: dbReminders, isLoading: remindersLoading } = useReminders();
  const { data: dbContacts, isLoading: contactsLoading } = useContacts();

  const userName = profile?.full_name || user?.user_metadata?.full_name || 'Friend';
  const plan = entitlements?.plan === 'pro' ? 'Pro' : 'Free';
  const contactsCount = dbContacts?.length ?? 0;

  // Filter contacts needing follow-up based on nudge_days
  const needsFollowUpList = useMemo(() => {
    if (!dbContacts || dbContacts.length === 0) return [];
    const nudgeDays = userSettings?.nudge_days ?? 30;
    const nudgesEnabled = userSettings?.nudges_enabled ?? true;
    const now = new Date();

    return dbContacts.filter((c) =>
      isFollowUpDue(
        {
          deleted_at: c.deleted_at,
          last_contacted_at: c.last_contacted_at,
          created_at: c.created_at,
        },
        nudgeDays,
        now,
        nudgesEnabled
      )
    );
  }, [dbContacts, userSettings]);

  // Today reminders
  const todayReminders = useMemo(() => {
    if (!dbReminders) return [];
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);

    return dbReminders.filter((r) => {
      if (!r.remind_at) return false;
      const rDateStr = new Date(r.remind_at).toISOString().slice(0, 10);
      return rDateStr === todayStr;
    });
  }, [dbReminders]);

  return (
    <div className="w-full max-w-[1100px] mx-auto px-4 py-4 md:py-6">
      {/* ================= MOBILE HEADER (only on < 768px) ================= */}
      <div className="md:hidden flex items-center justify-between mb-4 select-none">
        <div className="flex items-center gap-3">
          <Link href="/settings" className="hover:opacity-85 transition-opacity" aria-label="Open Settings">
            <Avatar name={userName} size="md" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-medium text-text leading-tight">
                Good morning, {userName.split(' ')[0]}
              </h1>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-textSecondary">
                {contactsLoading ? '...' : `${contactsCount} people in network`}
              </span>
              <Link
                href="/settings/subscription"
                className="inline-flex items-center gap-1 bg-accentTint text-accentDark text-[10px] font-medium px-2 py-0.5 rounded-full hover:bg-accent hover:text-white transition-colors"
              >
                <span>{plan}</span>
                {plan === 'Free' && <span className="text-accent">• Upgrade</span>}
              </Link>
            </div>
          </div>
        </div>

        {/* Header Action Icons */}
        <div className="flex items-center gap-2">
          {plan === 'Free' && (
            <Link
              href="/upgrade"
              className="w-9 h-9 rounded-full bg-accentTint flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-colors"
              aria-label="Unlock Pro"
            >
              <IconCrown size={18} />
            </Link>
          )}
          <Link
            href="/settings"
            className="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center text-textSecondary hover:text-text transition-colors"
            aria-label="Settings"
          >
            <IconSettings size={18} />
          </Link>
        </div>
      </div>

      {/* MOBILE SEARCH BAR */}
      <div className="md:hidden mb-4">
        <div
          onClick={() => router.push('/search')}
          className="flex items-center h-[42px] bg-white rounded-input border border-border px-3.5 cursor-pointer shadow-xs"
        >
          <IconSearch size={18} className="text-textMuted mr-2.5 flex-shrink-0" />
          <span className="text-sm text-textMuted">Search name, company, note...</span>
        </div>
      </div>

      {/* ================= HERO SECTION / TODAY CARD ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-4">
        <Card
          onClick={() => router.push('/notes')}
          className="md:col-span-2 relative p-4 sm:p-5 bg-white border border-border cursor-pointer hover:border-accent/40 transition-all overflow-hidden"
        >
          <OrangeCorner size="lg">
            <IconArrowUpRight size={24} stroke={2.5} />
          </OrangeCorner>

          <div className="pr-16">
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-xs font-medium text-accent uppercase tracking-wider">
                Today
              </span>
            </div>

            {remindersLoading ? (
              <div className="space-y-2 py-2">
                <Skeleton className="h-6 w-3/5" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            ) : todayReminders.length > 0 ? (
              <>
                <h2 className="text-lg sm:text-xl font-medium text-text mb-1">
                  {todayReminders.length} follow-up{todayReminders.length > 1 ? 's' : ''} scheduled today
                </h2>
                <p className="text-xs sm:text-sm text-textSecondary mb-4">
                  {todayReminders
                    .slice(0, 3)
                    .map((r) => r.contact?.name || r.title || 'Follow-up')
                    .join(' • ')}
                </p>

                <div className="space-y-2 pt-1 border-t border-divider">
                  {todayReminders.slice(0, 2).map((r) => {
                    const timeStr = r.remind_at
                      ? new Date(r.remind_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '';
                    return (
                      <div key={r.id} className="flex items-center justify-between text-xs py-1">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                          <span className="font-medium text-text truncate">
                            {r.contact?.name || r.title || 'Reminder'}
                          </span>
                          {r.body && (
                            <span className="text-textSecondary truncate hidden sm:inline">
                              • {r.body}
                            </span>
                          )}
                        </div>
                        {timeStr && (
                          <span className="text-[11px] text-textMuted ml-2 flex-shrink-0">{timeStr}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="py-2">
                <h2 className="text-lg sm:text-xl font-medium text-text mb-1">
                  No follow-ups scheduled for today
                </h2>
                <p className="text-xs sm:text-sm text-textSecondary">
                  You are all caught up. Tap to add a new note or reminder.
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* ASK RECALLR MINI CARD */}
        <Card
          onClick={() => router.push('/ask')}
          className="relative p-4 sm:p-5 bg-white border border-border cursor-pointer hover:border-accent/40 transition-all overflow-hidden flex flex-col justify-between"
        >
          <OrangeCorner size="md">
            <IconSparkles size={20} />
          </OrangeCorner>

          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-accentTint flex items-center justify-center text-accent">
                <IconSparkles size={16} />
              </div>
              <span className="text-xs font-medium text-text">Ask Recallr</span>
            </div>
            <p className="text-sm font-medium text-text leading-snug mb-2">
              &ldquo;Who sells plastics in Rajkot?&rdquo;
            </p>
            <p className="text-xs text-textSecondary">
              Instant AI answers from your contact notes & history.
            </p>
          </div>

          <div className="mt-3 flex items-center gap-1 text-xs text-accent font-medium">
            <span>Ask question</span>
            <IconArrowUpRight size={14} />
          </div>
        </Card>
      </div>

      {/* ================= 4 QUICK ACTION TILES ================= */}
      <div className="grid grid-cols-4 gap-2.5 sm:gap-3 mb-5">
        <Link
          href="/scan"
          className="p-3 bg-white rounded-card border border-border hover:border-accent/40 transition-all flex flex-col items-center justify-center text-center group shadow-xs"
        >
          <div className="w-10 h-10 rounded-[12px] bg-accentTint text-accent flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
            <IconScan size={20} />
          </div>
          <span className="text-xs font-medium text-text">Scan Card</span>
        </Link>

        <Link
          href="/people/new"
          className="p-3 bg-white rounded-card border border-border hover:border-accent/40 transition-all flex flex-col items-center justify-center text-center group shadow-xs"
        >
          <div className="w-10 h-10 rounded-[12px] bg-accentTint text-accent flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
            <IconUserPlus size={20} />
          </div>
          <span className="text-xs font-medium text-text">Add Person</span>
        </Link>

        <Link
          href="/notes?new=1"
          className="p-3 bg-white rounded-card border border-border hover:border-accent/40 transition-all flex flex-col items-center justify-center text-center group shadow-xs"
        >
          <div className="w-10 h-10 rounded-[12px] bg-accentTint text-accent flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
            <IconNotebook size={20} />
          </div>
          <span className="text-xs font-medium text-text">New Note</span>
        </Link>

        <Link
          href="/my-card"
          className="p-3 bg-white rounded-card border border-border hover:border-accent/40 transition-all flex flex-col items-center justify-center text-center group shadow-xs"
        >
          <div className="w-10 h-10 rounded-[12px] bg-accentTint text-accent flex items-center justify-center mb-1.5 group-hover:scale-105 transition-transform">
            <IconId size={20} />
          </div>
          <span className="text-xs font-medium text-text">My Card</span>
        </Link>
      </div>

      {/* ================= 2-COLUMN LOWER SECTION ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LEFT COLUMN: CATEGORIES OVERVIEW */}
        <div>
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <h2 className="text-sm font-medium text-text">Categories</h2>
            <Link
              href="/categories"
              className="text-xs text-accent font-medium hover:underline flex items-center gap-0.5"
            >
              <span>See all ({dbCategories?.length ?? 0})</span>
              <IconArrowUpRight size={14} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {categoriesLoading ? (
              <>
                <Skeleton className="h-20 rounded-card" />
                <Skeleton className="h-20 rounded-card" />
              </>
            ) : dbCategories && dbCategories.length > 0 ? (
              dbCategories.slice(0, 3).map((cat) => (
                <Card
                  key={cat.id}
                  onClick={() => router.push(`/categories/${cat.id}`)}
                  className="p-3.5 bg-white border border-border cursor-pointer hover:border-accent/40 transition-all overflow-hidden relative"
                >
                  <OrangeCorner size="sm">
                    <span className="text-[11px] font-medium text-white">{cat.count ?? 0}</span>
                  </OrangeCorner>
                  <div className="pr-8">
                    <div className="text-sm font-medium text-text truncate">
                      {cat.name}
                    </div>
                    <div className="text-[11px] text-textSecondary mt-0.5">
                      {cat.count ?? 0} {cat.count === 1 ? 'contact' : 'contacts'}
                    </div>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-2 p-4 bg-white rounded-card border border-border text-center">
                <p className="text-xs text-textSecondary">No categories yet</p>
              </div>
            )}

            <Card
              onClick={() => router.push('/categories?new=1')}
              className="p-3.5 bg-white border border-dashed border-accent/60 cursor-pointer hover:bg-accentTintSoft transition-all flex flex-col items-center justify-center text-center min-h-[72px]"
            >
              <div className="flex items-center gap-1.5 text-xs font-medium text-accent">
                <IconPlus size={16} />
                <span>New Category</span>
              </div>
            </Card>
          </div>
        </div>

        {/* RIGHT COLUMN: NEEDS FOLLOW-UP CARD */}
        <div>
          <div className="flex items-center justify-between mb-2.5 px-0.5">
            <h2 className="text-sm font-medium text-text">Needs Follow-up</h2>
            <span className="text-xs text-textSecondary">
              Over {userSettings?.nudge_days ?? 30} days
            </span>
          </div>

          <Card className="bg-white border border-border divide-y divide-divider overflow-hidden">
            {contactsLoading ? (
              <div className="p-3 space-y-3">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : needsFollowUpList.length > 0 ? (
              needsFollowUpList.slice(0, 4).map((c) => {
                const daysAgo = Math.floor(
                  (Date.now() - new Date(c.last_contacted_at || c.created_at).getTime()) /
                    (1000 * 60 * 60 * 24)
                );
                return (
                  <div
                    key={c.id}
                    className="p-3 flex items-center justify-between gap-3 hover:bg-black/[0.015] transition-colors"
                  >
                    <Link href={`/people/${c.id}`} className="flex items-center gap-3 min-w-0 flex-1">
                      <Avatar name={c.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-text truncate">{c.name}</div>
                        <div className="text-[11px] text-textSecondary truncate">
                          {c.company ? `${c.company} • ` : ''}Last met {daysAgo} days ago
                        </div>
                      </div>
                    </Link>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {c.phone && (
                        <>
                          <a
                            href={`tel:${c.phone}`}
                            className="w-8 h-8 rounded-full bg-accentTint flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-colors"
                            aria-label={`Call ${c.name}`}
                          >
                            <IconPhone size={15} />
                          </a>
                          <a
                            href={`https://wa.me/${c.phone.replace(/\D/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-8 h-8 rounded-full bg-accentTint flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-colors"
                            aria-label={`WhatsApp ${c.name}`}
                          >
                            <IconBrandWhatsapp size={15} />
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center">
                <div className="w-10 h-10 rounded-full bg-accentTint text-accent flex items-center justify-center mx-auto mb-2">
                  <IconCheck size={18} stroke={2.5} />
                </div>
                <p className="text-xs font-medium text-text">All caught up!</p>
                <p className="text-[11px] text-textSecondary mt-0.5">
                  No contacts overdue for follow-up right now.
                </p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
