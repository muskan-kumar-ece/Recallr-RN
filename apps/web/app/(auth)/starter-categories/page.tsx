'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconCheck,
  IconPlus,
} from '@tabler/icons-react';
import { Button } from '@/components/ui/Button';
import { CategorySheet } from '@/components/categories/CategorySheet';
import { useCompleteOnboarding } from '@recallr/api';
import { useRecallrAuth } from '@/providers/RecallrProvider';
import { tokens } from '@recallr/tokens';

export default function StarterCategoriesPage() {
  const router = useRouter();
  const { user, loading, session } = useRecallrAuth();
  const { mutateAsync: completeOnboarding, isPending } = useCompleteOnboarding();

  const [categories, setCategories] = useState<Array<{ id: string; name: string; color: string }>>([
    { id: 'school-friends', name: 'School Friends', color: tokens.colors.accent },
    { id: 'colleagues', name: 'Colleagues', color: tokens.colors.accent },
    { id: 'app-developers', name: 'App Developers', color: tokens.colors.accent },
    { id: 'clients', name: 'Clients', color: tokens.colors.accent },
    { id: 'suppliers', name: 'Suppliers', color: tokens.colors.accent },
  ]);

  const [selectedIds, setSelectedIds] = useState<string[]>([
    'colleagues',
    'clients',
  ]);
  const [isCategorySheetOpen, setIsCategorySheetOpen] = useState(false);

  useEffect(() => {
    if (!loading && !session) router.replace('/sign-in');
  }, [loading, session, router]);

  const toggleCategory = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleCreateCustomCategory = (data: { name: string; color: string }) => {
    const newId = data.name.toLowerCase().replace(/\s+/g, '-');
    setCategories((prev) => [...prev, { id: newId, name: data.name, color: data.color }]);
    setSelectedIds((prev) => [...prev, newId]);
  };

  const handleContinue = async () => {
    try {
      await completeOnboarding(categories
        .filter((category) => selectedIds.includes(category.id))
        .map((category) => ({ name: category.name, color: category.color, icon: 'folder' })));
      router.replace('/');
    } catch (error: unknown) {
      window.alert(error instanceof Error ? error.message : 'Could not save your starter categories. Try again.');
    }
  };

  const buttonLabel =
    selectedIds.length > 0
      ? `Continue (${selectedIds.length} selected)`
      : 'Continue';

  return (
    <div className="min-h-screen bg-bg flex flex-col justify-between max-w-md mx-auto px-6 py-10">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-1.5">
          <h1 className="text-2xl font-medium text-text">
            Who do you want to remember?
          </h1>
          <p className="text-xs sm:text-sm text-textSecondary">
            Pick a few to start. You can change these anytime.
          </p>
        </div>

        {/* 2-Column Cards Grid */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          {categories.map((cat) => {
            const isSelected = selectedIds.includes(cat.id);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleCategory(cat.id)}
                className={`p-4 rounded-card text-left transition-all relative flex flex-col justify-between h-24 border ${
                  isSelected
                    ? 'bg-accentTintSoft border-accent shadow-sm'
                    : 'bg-white border-border hover:border-accent/40'
                }`}
              >
                <span className="text-xs sm:text-sm font-medium text-text">
                  {cat.name}
                </span>

                <div className="flex justify-end">
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                      isSelected
                        ? 'bg-accent text-white'
                        : 'border border-borderStrong'
                    }`}
                  >
                    {isSelected && <IconCheck size={14} stroke={3} />}
                  </div>
                </div>
              </button>
            );
          })}

          {/* Dashed Create Your Own Card */}
          <button
            type="button"
            onClick={() => setIsCategorySheetOpen(true)}
            className="p-4 rounded-card border-2 border-dashed border-border hover:border-accent bg-white/50 text-left transition-colors flex flex-col justify-between h-24 group"
          >
            <span className="text-xs sm:text-sm font-medium text-textSecondary group-hover:text-text">
              Create your own
            </span>
            <div className="flex justify-end">
              <div className="w-6 h-6 rounded-full bg-fill group-hover:bg-accentTint text-textMuted group-hover:text-accent flex items-center justify-center transition-colors">
                <IconPlus size={14} />
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Bottom CTA */}
      <div className="pt-8">
        <Button
          variant="primary"
          size="md"
          onClick={() => void handleContinue()}
          disabled={isPending || !user}
          style={{ width: '100%' }}
        >
          {buttonLabel}
        </Button>
      </div>

      <CategorySheet
        isOpen={isCategorySheetOpen}
        onClose={() => setIsCategorySheetOpen(false)}
        onSave={handleCreateCustomCategory}
      />
    </div>
  );
}
