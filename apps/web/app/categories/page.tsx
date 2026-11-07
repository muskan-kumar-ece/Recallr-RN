'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  IconPlus,
  IconCheck,
  IconFolders,
} from '@tabler/icons-react';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { OrangeCorner } from '@/components/ui/OrangeCorner';
import { Button } from '@/components/ui/Button';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Toast } from '@/components/ui/Toast';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCategories, useCreateCategory, useContacts } from '@recallr/api';

function CategoriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const { data: dbCategories, isLoading: categoriesLoading } = useCategories();
  const { data: dbContacts } = useContacts();
  const { mutate: createCategoryMutate, isPending: isCreating } = useCreateCategory();

  const [isNewOpen, setIsNewOpen] = useState(searchParams.get('new') === '1');
  const [newCatName, setNewCatName] = useState('');
  const [selectedColor, setSelectedColor] = useState('#E8641B');
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const colorOptions = ['#E8641B', '#4F5BD5', '#1D9E75', '#D4537E', '#444441'];

  const categories = dbCategories || [];
  const totalContacts = dbContacts?.length ?? 0;

  const handleCreateCategory = () => {
    if (!newCatName.trim()) {
      setToastMessage('Please enter a category name');
      setToastVisible(true);
      return;
    }

    createCategoryMutate(
      {
        input: {
          name: newCatName.trim(),
          color: selectedColor,
          icon: 'folder',
        },
      },
      {
        onSuccess: () => {
          setIsNewOpen(false);
          setNewCatName('');
          setToastMessage(`Category "${newCatName.trim()}" created`);
          setToastVisible(true);
        },
        onError: (err: unknown) => {
          const msg = err instanceof Error ? err.message : 'Failed to create category';
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
        title="Categories"
        subtitle={`${categories.length} categories • ${totalContacts} contacts`}
        rightAction={
          <Button
            variant="primary"
            size="sm"
            icon={<IconPlus size={16} />}
            onClick={() => setIsNewOpen(true)}
          >
            New
          </Button>
        }
      />

      {/* 2-Column Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {categoriesLoading ? (
          <>
            <Skeleton className="h-28 rounded-card" />
            <Skeleton className="h-28 rounded-card" />
          </>
        ) : categories.length === 0 ? (
          <div className="col-span-full">
            <EmptyState
              icon={<IconFolders size={24} />}
              title="No categories yet"
              description="Group your network into categories like Plastic Business, Suppliers, or College Friends."
              primaryAction={{
                label: 'Create Category',
                onClick: () => setIsNewOpen(true),
              }}
            />
          </div>
        ) : (
          categories.map((cat) => (
            <Card
              key={cat.id}
              onClick={() => router.push(`/categories/${cat.id}`)}
              className="p-4 bg-white border border-border hover:border-accent/40 cursor-pointer transition-all overflow-hidden relative"
            >
              <OrangeCorner size="sm">
                <span className="text-[11px] font-medium text-white">
                  {cat.count ?? 0}
                </span>
              </OrangeCorner>

              <div className="pr-12">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: cat.color || '#E8641B' }}
                  />
                  <h3 className="text-sm font-medium text-text truncate">
                    {cat.name}
                  </h3>
                </div>
                <div className="text-[11px] text-textMuted mt-2">
                  {cat.count ?? 0} {cat.count === 1 ? 'contact' : 'contacts'}
                </div>
              </div>
            </Card>
          ))
        )}

        {/* Add Category Card */}
        <Card
          onClick={() => setIsNewOpen(true)}
          className="p-4 bg-white border border-dashed border-accent/60 cursor-pointer hover:bg-accentTintSoft transition-all flex flex-col items-center justify-center text-center min-h-[110px]"
        >
          <div className="w-9 h-9 rounded-full bg-accentTint flex items-center justify-center text-accent mb-2">
            <IconPlus size={18} />
          </div>
          <span className="text-xs font-medium text-accent">
            Create New Category
          </span>
        </Card>
      </div>

      {/* ================= NEW CATEGORY BOTTOM SHEET / MODAL ================= */}
      <BottomSheet
        isOpen={isNewOpen}
        onClose={() => setIsNewOpen(false)}
        title="New Category"
        isDesktopDialog
      >
        <div className="space-y-4 pb-4">
          {/* Live Preview Card */}
          <div className="p-4 bg-white rounded-card border border-border relative overflow-hidden">
            <OrangeCorner size="sm">
              <span className="text-[11px] font-medium text-white">0</span>
            </OrangeCorner>
            <div className="pr-12">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: selectedColor }}
                />
                <span className="text-sm font-medium text-text">
                  {newCatName || 'Category Name'}
                </span>
              </div>
              <span className="text-[11px] text-textMuted">0 contacts</span>
            </div>
          </div>

          <div>
            <label className="block text-xs text-textSecondary mb-1">Category Name</label>
            <input
              type="text"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Suppliers, Friends, Plastic Business"
              className="w-full h-10 px-3 bg-bg rounded-input border border-border text-sm text-text focus:outline-none focus:border-accent"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs text-textSecondary mb-2">Category Color</label>
            <div className="flex items-center gap-3">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setSelectedColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-white transition-transform ${
                    selectedColor === c ? 'ring-2 ring-offset-2 ring-accent scale-110' : 'hover:scale-105'
                  }`}
                >
                  {selectedColor === c && <IconCheck size={16} stroke={3} />}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="primary"
              size="md"
              disabled={isCreating}
              onClick={handleCreateCategory}
              style={{ width: '100%' }}
            >
              {isCreating ? 'Creating...' : 'Create Category'}
            </Button>
          </div>
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

export default function CategoriesPage() {
  return (
    <Suspense fallback={null}>
      <CategoriesContent />
    </Suspense>
  );
}
