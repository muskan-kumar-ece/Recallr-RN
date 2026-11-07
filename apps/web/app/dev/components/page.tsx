'use client';

import React, { useState } from 'react';
import {
  IconArrowUpRight,
  IconSparkles,
  IconPhone,
  IconBrandWhatsapp,
  IconMail,
  IconBell,
  IconScan,
  IconPlus,
} from '@tabler/icons-react';
import {
  Card,
  OrangeCorner,
  Button,
  Chip,
  Avatar,
  IconTile,
  ListRow,
  FieldRow,
  SearchBar,
  Toggle,
  SegmentedControl,
  ProgressBar,
  BottomSheet,
  Toast,
  Banner,
  EmptyState,
  Skeleton,
  TabBar,
  LimitReachedSheet,
  LimitType,
} from '@/components/ui';

export default function DevComponentsParityPage() {
  const [toggleVal, setToggleVal] = useState(true);
  const [segmentVal, setSegmentVal] = useState<'day' | 'week' | 'month'>('week');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);
  const [limitSheetType, setLimitSheetType] = useState<LimitType | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'people' | 'notes' | 'ask'>('home');

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6 space-y-8">
      {/* Title */}
      <div className="border-b border-divider pb-4">
        <h1 className="text-2xl font-medium text-text">Design System Component Parity</h1>
        <p className="text-xs text-textSecondary mt-1">
          Recallr Design Tokens & UI Components Showcase • Web & Mobile Parity Spec
        </p>
      </div>

      {/* ================= 0. DEPTH & CONTRAST ================= */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium text-textSecondary uppercase tracking-wider">
          0. Depth & Contrast (New bg #F2F0EB & shadowCard)
        </h2>
        <Card className="p-4 bg-white border border-border shadow-card space-y-3">
          <div className="text-xs font-medium text-text">Card on #F2F0EB background</div>
          <div className="text-[11px] text-textMuted">Uses soft shadowCard and 0.5px border</div>
          <Card flat className="p-3 bg-fill border-0">
            <div className="text-xs font-medium text-text">Nested Card (flat=true)</div>
            <div className="text-[11px] text-textSecondary mt-0.5">
              Inside cards stay flat without extra elevation shadow
            </div>
          </Card>
        </Card>
      </section>

      {/* ================= 1. ORANGE CORNER GEOMETRY ================= */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium text-textSecondary uppercase tracking-wider">
          1. Signature Orange Corner Accents
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-4 bg-white border border-border relative overflow-hidden h-28">
            <OrangeCorner size="lg">
              <IconArrowUpRight size={22} stroke={2.5} />
            </OrangeCorner>
            <div className="text-xs font-medium text-text">Large Corner (lg)</div>
            <div className="text-[11px] text-textMuted">78×58px, r40 (Hero cards)</div>
          </Card>

          <Card className="p-4 bg-white border border-border relative overflow-hidden h-28">
            <OrangeCorner size="md">
              <IconSparkles size={18} />
            </OrangeCorner>
            <div className="text-xs font-medium text-text">Medium Corner (md)</div>
            <div className="text-[11px] text-textMuted">56×44px, r32 (Action cards)</div>
          </Card>

          <Card className="p-4 bg-white border border-border relative overflow-hidden h-28">
            <OrangeCorner size="sm">
              <span className="text-[11px] font-medium text-white">18</span>
            </OrangeCorner>
            <div className="text-xs font-medium text-text">Small Corner (sm)</div>
            <div className="text-[11px] text-textMuted">48×38px, r26 (Counts)</div>
          </Card>
        </div>
      </section>

      {/* ================= 2. BUTTONS ================= */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium text-textSecondary uppercase tracking-wider">
          2. Buttons (Variants & Sizes)
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" size="md">
            Primary md
          </Button>
          <Button variant="outline" size="md">
            Outline md
          </Button>
          <Button variant="secondary" size="md">
            Secondary md
          </Button>
          <Button variant="danger" size="md">
            Danger md
          </Button>
          <Button variant="text" size="md">
            Text md
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" size="sm" icon={<IconPlus size={16} />}>
            Primary sm
          </Button>
          <Button variant="outline" size="sm" icon={<IconScan size={16} />}>
            Outline sm
          </Button>
          <Button variant="primary" size="sm" disabled>
            Disabled
          </Button>
          <Button variant="primary" size="sm" loading>
            Loading
          </Button>
        </div>
      </section>

      {/* ================= 3. CHIPS ================= */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium text-textSecondary uppercase tracking-wider">
          3. Chips
        </h2>
        <div className="flex flex-wrap items-center gap-2">
          <Chip variant="default">Default Chip</Chip>
          <Chip variant="selected">Selected Chip</Chip>
          <Chip variant="outline">Outline Chip</Chip>
          <Chip variant="tag">Tag Chip</Chip>
          <Chip variant="dashed">+ Dashed New</Chip>
        </div>
      </section>

      {/* ================= 4. AVATARS ================= */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium text-textSecondary uppercase tracking-wider">
          4. Avatars
        </h2>
        <div className="flex items-center gap-4">
          <Avatar name="Ramesh Kumar" size="xs" />
          <Avatar name="Ramesh Kumar" size="sm" />
          <Avatar name="Ramesh Kumar" size="md" />
          <Avatar name="Ramesh Kumar" size="lg" />
          <Avatar name="Ramesh Kumar" size="xl" showBadge />
        </div>
      </section>

      {/* ================= 5. ICON TILES ================= */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium text-textSecondary uppercase tracking-wider">
          5. Icon Tiles
        </h2>
        <div className="flex items-center gap-3">
          <IconTile size="sm" icon={<IconPhone size={15} />} />
          <IconTile size="md" icon={<IconBrandWhatsapp size={18} />} />
          <IconTile size="lg" icon={<IconMail size={22} />} />
          <IconTile size="xl" icon={<IconBell size={24} />} />
        </div>
      </section>

      {/* ================= 6. LIST ROWS & FIELD ROWS ================= */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium text-textSecondary uppercase tracking-wider">
          6. List Rows & Field Rows
        </h2>
        <Card className="bg-white border border-border divide-y divide-divider overflow-hidden">
          <ListRow
            leading={<Avatar name="Ramesh Kumar" size="sm" />}
            title="Ramesh Kumar"
            subtitle="Apex Polymers • Rajkot"
            followUpDue
            tag="Plastic"
            showChevron
          />
          <ListRow
            leading={<Avatar name="Priya Sharma" size="sm" />}
            title="Priya Sharma"
            subtitle="Gujarat CNC Tools • Vadodara"
            tag="Machinery"
            showChevron
          />
          <FieldRow
            label="Phone"
            value="+91 98765 43210"
            icon={<IconPhone size={15} />}
          />
          <FieldRow
            label="Category"
            value="Plastic Business"
            icon={<IconSparkles size={15} />}
          />
        </Card>
      </section>

      {/* ================= 7. CONTROLS: SEARCHBAR, TOGGLE, SEGMENTED CONTROL ================= */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium text-textSecondary uppercase tracking-wider">
          7. Inputs & Controls
        </h2>
        <SearchBar placeholder="Search name, company, note..." />

        <div className="flex items-center justify-between p-3.5 bg-white rounded-card border border-border">
          <span className="text-xs font-medium text-text">Interactive Toggle Switch</span>
          <Toggle checked={toggleVal} onChange={setToggleVal} />
        </div>

        <div className="flex items-center justify-between p-3.5 bg-white rounded-card border border-border">
          <span className="text-xs font-medium text-text">Segmented Control</span>
          <SegmentedControl
            options={[
              { label: 'Day', value: 'day' },
              { label: 'Week', value: 'week' },
              { label: 'Month', value: 'month' },
            ]}
            value={segmentVal}
            onChange={setSegmentVal}
          />
        </div>
      </section>

      {/* ================= 8. PROGRESS BARS & BANNERS ================= */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium text-textSecondary uppercase tracking-wider">
          8. Progress Bar & Banners
        </h2>
        <div className="space-y-2 p-4 bg-white rounded-card border border-border">
          <div className="flex justify-between text-xs">
            <span>Contact Limit</span>
            <span>38/50 (76%)</span>
          </div>
          <ProgressBar value={76} />
        </div>

        <Banner
          variant="warning"
          message="You have 2 follow-ups due today with Ramesh and Priya."
          action={<button className="underline">View</button>}
        />

        <Banner
          variant="offline"
          message="You are offline. Changes will automatically sync when reconnected."
        />
      </section>

      {/* ================= 9. EMPTY STATE & SKELETON ================= */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium text-textSecondary uppercase tracking-wider">
          9. Empty State & Skeleton Loaders
        </h2>
        <EmptyState
          icon={<IconSparkles size={26} />}
          title="No contacts found"
          description="Try searching with another name or company, or add a new person to your network."
          primaryAction={{
            label: 'Add Contact',
            onClick: () => {},
          }}
        />

        <div className="bg-white rounded-card border border-border overflow-hidden">
          <Skeleton variant="row" />
          <Skeleton variant="row" />
        </div>
      </section>

      {/* ================= 10. MODAL / BOTTOMSHEET TRIGGER & TOAST TRIGGER ================= */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium text-textSecondary uppercase tracking-wider">
          10. Overlays, Limits & Toasts
        </h2>
        <div className="flex flex-wrap items-center gap-3">
          <Button variant="outline" size="sm" onClick={() => setSheetOpen(true)}>
            Open Generic Sheet
          </Button>

          <Button variant="outline" size="sm" onClick={() => setLimitSheetType('contacts')}>
            Contacts Limit (50/50)
          </Button>

          <Button variant="outline" size="sm" onClick={() => setLimitSheetType('scans')}>
            Scans Limit (10/10)
          </Button>

          <Button variant="outline" size="sm" onClick={() => setLimitSheetType('ai')}>
            AI Questions Limit (5/5)
          </Button>

          <Button variant="outline" size="sm" onClick={() => setLimitSheetType('cards')}>
            Digital Cards Limit (1 card)
          </Button>

          <Button variant="outline" size="sm" onClick={() => setToastOpen(true)}>
            Show Undo Toast
          </Button>
        </div>
      </section>

      {/* ================= 11. TABBAR SHOWCASE ================= */}
      <section className="space-y-3">
        <h2 className="text-xs font-medium text-textSecondary uppercase tracking-wider">
          11. Floating TabBar (Height 64, Radius 30, Raised 54px + Button with shadowNav & shadowAccent)
        </h2>
        <div className="flex justify-center p-4 bg-bg rounded-card border border-border">
          <div className="w-full max-w-[400px]">
            <TabBar
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onQuickAdd={() => setToastOpen(!toastOpen)}
              isQuickAddOpen={toastOpen}
              notesBadgeCount={2}
            />
          </div>
        </div>
      </section>

      {/* Bottom Sheet Demo */}
      <BottomSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="Parity BottomSheet / Dialog"
        isDesktopDialog
      >
        <div className="p-2 space-y-3 text-xs text-textSecondary">
          <p>
            On phone widths (&lt; 768px), this slides from the bottom with radius 24 and drag handle.
          </p>
          <p>
            On tablet and desktop (&gt;= 768px), this renders as a centered dialog modal with radius 16.
          </p>
          <Button variant="primary" size="md" onClick={() => setSheetOpen(false)} style={{ width: '100%' }}>
            Done
          </Button>
        </div>
      </BottomSheet>

      {/* Toast Demo */}
      <Toast
        message="Contact deleted from your network"
        actionText="Undo"
        onAction={() => setToastOpen(false)}
        isVisible={toastOpen}
      />

      <LimitReachedSheet
        isOpen={!!limitSheetType}
        onClose={() => setLimitSheetType(null)}
        type={limitSheetType || 'contacts'}
      />
    </div>
  );
}
