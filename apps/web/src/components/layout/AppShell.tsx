'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useRecallrAuth } from '@/providers/RecallrProvider';
import { useProfile, useEntitlements, useReminders, useUserSettings } from '@recallr/api';
import {
  IconHome,
  IconUsers,
  IconNotebook,
  IconSparkles,
  IconFolders,
  IconId,
  IconSettings,
  IconPlus,
  IconSearch,
  IconBell,
  IconScan,
  IconUserPlus,
  IconCode,
  IconCrown,
  IconCreditCard,
  IconQrcode,
  IconUpload,
  IconChevronRight,
  IconArrowRight,
} from '@tabler/icons-react';
import { TabBar, TabKey } from '@/components/ui/TabBar';
import { Avatar } from '@/components/ui/Avatar';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Button } from '@/components/ui/Button';
import { OrangeCorner } from '@/components/ui/OrangeCorner';

export interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { user, session, loading } = useRecallrAuth();
  const { data: profile } = useProfile(user?.id);
  const { data: entitlements } = useEntitlements();
  const { data: dbReminders } = useReminders();
  const { data: userSettings } = useUserSettings();
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  const notesBadgeCount = useMemo(() => {
    if (!dbReminders) return 0;
    const now = new Date();
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return dbReminders.filter((r) => !r.done_at && r.remind_at && new Date(r.remind_at) <= todayEnd).length;
  }, [dbReminders]);

  // If public card page or auth onboarding pages, don't render navigation shell
  const isPublicRoute =
    pathname.startsWith('/c/') ||
    pathname === '/welcome' ||
    pathname === '/sign-in' ||
    pathname === '/starter-categories' ||
    pathname.startsWith('/dev/');

  const onboardingRequired = Boolean(session && userSettings !== undefined && !userSettings?.onboarding_done && pathname !== '/starter-categories');

  useEffect(() => {
    if (!loading && !session && !isPublicRoute) {
      router.replace('/sign-in');
    }
  }, [loading, session, isPublicRoute, router]);

  useEffect(() => {
    if (onboardingRequired) router.replace('/starter-categories');
  }, [onboardingRequired, router]);

  if (isPublicRoute) {
    return <>{children}</>;
  }

  if (onboardingRequired) {
    return <div className="min-h-screen bg-bg" aria-busy="true" />;
  }

  if (loading || !session) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-[14px] bg-accent flex items-center justify-center text-white font-bold text-2xl shadow-sm animate-pulse">
          R
        </div>
        <p className="text-xs text-textSecondary">Loading Recallr...</p>
      </div>
    );
  }

  const displayName = profile?.full_name || user?.user_metadata?.full_name || user?.email || user?.phone || 'My Account';
  const isPro = entitlements?.plan === 'pro';

  const navItems = [
    { label: 'Home', href: '/', icon: <IconHome size={19} />, key: 'home' },
    { label: 'People', href: '/people', icon: <IconUsers size={19} />, key: 'people' },
    { label: 'Notes', href: '/notes', icon: <IconNotebook size={19} />, key: 'notes' },
    { label: 'Ask AI', href: '/ask', icon: <IconSparkles size={19} />, key: 'ask' },
    { label: 'Categories', href: '/categories', icon: <IconFolders size={19} />, key: 'categories' },
    { label: 'My Card', href: '/my-card', icon: <IconId size={19} />, key: 'my-card' },
    { label: 'Settings', href: '/settings', icon: <IconSettings size={19} />, key: 'settings' },
    { label: 'Plan & Usage', href: '/settings/subscription', icon: <IconCreditCard size={19} />, key: 'subscription' },
    { label: 'Component Parity', href: '/dev/components', icon: <IconCode size={19} />, key: 'dev' },
  ];

  const getActiveTab = (): TabKey => {
    if (pathname.startsWith('/people')) return 'people';
    if (pathname.startsWith('/notes')) return 'notes';
    if (pathname.startsWith('/ask')) return 'ask';
    return 'home';
  };

  const handleTabChange = (tab: TabKey) => {
    switch (tab) {
      case 'home':
        router.push('/');
        break;
      case 'people':
        router.push('/people');
        break;
      case 'notes':
        router.push('/notes');
        break;
      case 'ask':
        router.push('/ask');
        break;
    }
  };

  return (
    <div className="min-h-screen bg-bg text-text flex">
      {/* ================= DESKTOP SIDEBAR (≥ 768px) ================= */}
      <aside className="hidden md:flex flex-col w-[240px] h-screen sticky top-0 bg-surface border-r border-border select-none z-30 flex-shrink-0">
        {/* Brand Header */}
        <div className="h-16 flex items-center px-5 border-b border-divider gap-2.5">
          <div className="w-8 h-8 rounded-[10px] bg-accent flex items-center justify-center text-white shadow-sm">
            <IconSparkles size={18} />
          </div>
          <div>
            <span className="text-base font-medium tracking-tight text-text">Recallr</span>
            <span className="text-[10px] ml-1.5 px-1.5 py-0.5 rounded-full bg-accentTint text-accentDark font-medium">
              v1.0
            </span>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.href === '/'
                ? pathname === '/'
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-[12px] text-sm font-medium transition-all duration-100 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 ${
                  isActive
                    ? 'bg-accentTint text-accent font-medium shadow-xs'
                    : 'text-textSecondary hover:bg-black/[0.03] hover:text-text'
                }`}
              >
                <span className={isActive ? 'text-accent' : 'text-textMuted'}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
                {item.key === 'notes' && notesBadgeCount > 0 && (
                  <span className="ml-auto text-[10px] font-bold bg-danger text-white px-1.5 py-0.5 rounded-full">
                    {notesBadgeCount > 9 ? '9+' : notesBadgeCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Bottom User Account Widget */}
        <div className="p-3 border-t border-divider">
          <Link
            href="/settings/subscription"
            className="flex items-center gap-2.5 p-2 rounded-[12px] hover:bg-black/[0.025] transition-colors"
          >
            <Avatar name={displayName} size="xs" />
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-text truncate">{displayName}</div>
              <div className="text-[10px] text-textSecondary flex items-center gap-1">
                <span>{isPro ? 'Pro Plan' : 'Free Plan'}</span>
                {!isPro && <span className="text-accent font-medium hover:underline">• Upgrade</span>}
              </div>
            </div>
          </Link>
        </div>
      </aside>

      {/* ================= MAIN CONTENT WRAPPER ================= */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* DESKTOP TOP BAR (≥ 768px) */}
        <header className="hidden md:flex items-center justify-between h-16 px-6 bg-surface/90 backdrop-blur border-b border-border sticky top-0 z-20">
          <div className="w-full max-w-md">
            <button
              type="button"
              onClick={() => router.push('/search')}
              className="w-full h-10 px-3.5 bg-bg rounded-input border border-border flex items-center justify-between text-xs text-textMuted hover:border-accent/50 transition-all text-left"
            >
              <div className="flex items-center gap-2">
                <IconSearch size={16} />
                <span>Search people, notes, companies...</span>
              </div>
              <kbd className="px-1.5 py-0.5 text-[10px] bg-surface rounded border border-border text-textMuted font-mono">
                ⌘K
              </kbd>
            </button>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              icon={<IconCrown size={15} />}
              onClick={() => router.push('/upgrade')}
              className="border-accent/40 text-accent hover:bg-accentTintSoft"
            >
              Upgrade
            </Button>

            <button
              type="button"
              onClick={() => router.push('/notes')}
              className="w-9 h-9 rounded-full bg-surface border border-border flex items-center justify-center text-textSecondary hover:text-text transition-colors relative"
              aria-label="Reminders"
            >
              <IconBell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-accent" />
            </button>

            <Button
              variant="primary"
              size="sm"
              icon={<IconPlus size={16} />}
              onClick={() => setQuickAddOpen(true)}
            >
              Quick Add
            </Button>
          </div>
        </header>

        {/* MAIN PAGE BODY */}
        <main className="flex-1 pb-24 md:pb-8">
          {children}
        </main>

        {/* MOBILE FLOATING TABBAR (< 768px) */}
        <div className="md:hidden fixed bottom-4 left-0 right-0 z-40 px-4 flex justify-center pointer-events-none">
          <div className="pointer-events-auto w-full max-w-[420px]">
            <TabBar
              activeTab={getActiveTab()}
              onTabChange={handleTabChange}
              onQuickAdd={() => setQuickAddOpen(true)}
              isQuickAddOpen={quickAddOpen}
              notesBadgeCount={notesBadgeCount}
            />
          </div>
        </div>
      </div>

      {/* QUICK ADD BOTTOM SHEET / DIALOG */}
      <BottomSheet
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        title="Add to your network"
        isDesktopDialog
      >
        <div className="space-y-2 pb-3">
          {/* 1. Scan business card (highlighted with OrangeCorner) */}
          <button
            type="button"
            onClick={() => {
              setQuickAddOpen(false);
              router.push('/scan');
            }}
            className="w-full relative flex items-center justify-between p-3.5 rounded-card bg-surface border border-accent/30 hover:border-accent hover:bg-accentTintSoft/40 transition-all text-left overflow-hidden group"
          >
            <OrangeCorner size="sm" title="Quick Scan">
              <IconArrowRight size={14} stroke={2.5} />
            </OrangeCorner>
            <div className="flex items-center gap-3.5 pr-8">
              <div className="w-10 h-10 rounded-[12px] bg-accent text-white flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <IconScan size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-text">Scan business card</div>
                <div className="text-xs text-textSecondary mt-0.5">Auto-fills name, company, phone</div>
              </div>
            </div>
            <IconChevronRight size={18} className="text-accent flex-shrink-0" />
          </button>

          {/* 2. Add manually */}
          <button
            type="button"
            onClick={() => {
              setQuickAddOpen(false);
              router.push('/people/new');
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-card bg-surface border border-border hover:border-accent/40 hover:bg-black/[0.015] transition-all text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-[12px] bg-accentTint text-accent flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <IconUserPlus size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-text">Add manually</div>
                <div className="text-xs text-textSecondary mt-0.5">Type the details yourself</div>
              </div>
            </div>
            <IconChevronRight size={18} className="text-textMuted flex-shrink-0" />
          </button>

          {/* 3. Scan Recallr QR */}
          <button
            type="button"
            onClick={() => {
              setQuickAddOpen(false);
              router.push('/scan?mode=qr');
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-card bg-surface border border-border hover:border-accent/40 hover:bg-black/[0.015] transition-all text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-[12px] bg-accentTint text-accent flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <IconQrcode size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-text">Scan Recallr QR</div>
                <div className="text-xs text-textSecondary mt-0.5">Save someone's digital card</div>
              </div>
            </div>
            <IconChevronRight size={18} className="text-textMuted flex-shrink-0" />
          </button>

          {/* 4. Import from contacts */}
          <button
            type="button"
            onClick={() => {
              setQuickAddOpen(false);
              router.push('/import');
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-card bg-surface border border-border hover:border-accent/40 hover:bg-black/[0.015] transition-all text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-[12px] bg-accentTint text-accent flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <IconUpload size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-text">Import contacts</div>
                <div className="text-xs text-textSecondary mt-0.5">Upload CSV or vCard (.vcf)</div>
              </div>
            </div>
            <IconChevronRight size={18} className="text-textMuted flex-shrink-0" />
          </button>

          {/* 5. Ask AI to add */}
          <button
            type="button"
            onClick={() => {
              setQuickAddOpen(false);
              router.push('/ask?focus=1');
            }}
            className="w-full flex items-center justify-between p-3.5 rounded-card bg-surface border border-border hover:border-accent/40 hover:bg-black/[0.015] transition-all text-left group"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-[12px] bg-accentTint text-accent flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                <IconSparkles size={20} />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium text-text">Ask AI to add</div>
                <div className="text-xs text-textSecondary mt-0.5">Say it or type it</div>
              </div>
            </div>
            <IconChevronRight size={18} className="text-textMuted flex-shrink-0" />
          </button>
        </div>
      </BottomSheet>
    </div>
  );
};
