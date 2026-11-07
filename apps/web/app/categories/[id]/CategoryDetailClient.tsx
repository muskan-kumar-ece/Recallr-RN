'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import {
  IconPlus,
  IconPhone,
  IconBrandWhatsapp,
  IconDotsVertical,
  IconTrash,
  IconSearch,
  IconUsers,
} from '@tabler/icons-react';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { Toast } from '@/components/ui/Toast';
import { BottomSheet } from '@/components/ui/BottomSheet';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { useCategories, useContacts, useDeleteCategory } from '@recallr/api';

export default function CategoryDetailClient() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params?.id as string;

  const { data: dbCategories, isLoading: categoriesLoading } = useCategories();
  const { data: dbContacts, isLoading: contactsLoading } = useContacts({
    categoryId: categoryId,
  });
  const { mutate: deleteCategoryMutate } = useDeleteCategory();

  const [searchQuery, setSearchQuery] = useState('');
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  // Match category
  const category = useMemo(() => {
    if (!dbCategories) return null;
    return dbCategories.find((c) => c.id === categoryId) || null;
  }, [dbCategories, categoryId]);

  const members = useMemo(() => {
    if (!dbContacts) return [];
    if (!searchQuery.trim()) return dbContacts;
    const q = searchQuery.toLowerCase();
    return dbContacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.company?.toLowerCase().includes(q) ||
        c.role?.toLowerCase().includes(q)
    );
  }, [dbContacts, searchQuery]);

  const handleDeleteCategory = () => {
    if (!category) return;
    deleteCategoryMutate(category.id);
    setToastMessage(`Category "${category.name}" deleted`);
    setToastVisible(true);
    setTimeout(() => {
      router.push('/categories');
    }, 1500);
  };

  const catName = category?.name || (categoriesLoading ? 'Loading...' : 'Category');
  const catColor = category?.color || '#E8641B';

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-4 md:py-6 space-y-4">
      {/* Header */}
      <ScreenHeader
        title={catName}
        subtitle={`${members.length} contacts`}
        onBack={() => router.push('/categories')}
        rightAction={
          <div className="flex items-center gap-1.5">
            <Link
              href={`/people/new?cat=${categoryId}`}
              className="w-9 h-9 rounded-full bg-accent text-white flex items-center justify-center hover:bg-accentPressed transition-colors shadow-xs"
              aria-label="Add person to category"
            >
              <IconPlus size={18} />
            </Link>
            <button
              type="button"
              onClick={() => setIsMoreMenuOpen(true)}
              className="w-9 h-9 rounded-full bg-white border border-border flex items-center justify-center text-textSecondary hover:text-text transition-colors shadow-xs"
              aria-label="Category options"
            >
              <IconDotsVertical size={18} />
            </button>
          </div>
        }
      />

      {/* Category Hero Banner */}
      <Card className="p-4 bg-white border border-border flex items-center gap-3">
        <div
          className="w-10 h-10 rounded-[12px] flex items-center justify-center text-white font-bold"
          style={{ backgroundColor: catColor }}
        >
          {catName[0] || 'C'}
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-base font-medium text-text">{catName}</h2>
          <p className="text-xs text-textSecondary mt-0.5">
            {members.length} {members.length === 1 ? 'person' : 'people'} in this category
          </p>
        </div>
      </Card>

      {/* Search Input */}
      <div className="relative">
        <IconSearch
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-textMuted"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={`Search ${catName} contacts...`}
          className="w-full h-10 pl-9 pr-3 bg-white rounded-input border border-border text-xs text-text placeholder:text-textMuted focus:outline-none focus:border-accent shadow-xs"
        />
      </div>

      {/* Members List */}
      <div className="space-y-2">
        {contactsLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-16 w-full rounded-card" />
            <Skeleton className="h-16 w-full rounded-card" />
          </div>
        ) : members.length === 0 ? (
          <EmptyState
            icon={<IconUsers size={24} />}
            title={searchQuery ? 'No matching contacts' : 'No contacts in this category'}
            description={
              searchQuery
                ? 'Try a different search query'
                : 'Add people to this category or edit existing contacts to assign them here.'
            }
            primaryAction={
              !searchQuery
                ? {
                    label: 'Add Contact',
                    onClick: () => router.push(`/people/new?cat=${categoryId}`),
                  }
                : undefined
            }
          />
        ) : (
          members.map((member) => (
            <Card
              key={member.id}
              className="p-3.5 bg-white border border-border hover:border-accent/40 transition-colors flex items-center justify-between gap-3"
            >
              <Link
                href={`/people/${member.id}`}
                className="flex items-center gap-3 min-w-0 flex-1"
              >
                <Avatar name={member.name} size="md" />
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-medium text-text truncate">
                    {member.name}
                  </h3>
                  <p className="text-xs text-textSecondary truncate">
                    {member.role ? `${member.role} • ` : ''}
                    {member.company || member.address || 'Contact'}
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {member.phone && (
                  <>
                    <a
                      href={`tel:${member.phone}`}
                      className="w-8 h-8 rounded-full bg-accentTint flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-colors"
                      aria-label={`Call ${member.name}`}
                    >
                      <IconPhone size={16} />
                    </a>
                    <a
                      href={`https://wa.me/${member.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 rounded-full bg-accentTint flex items-center justify-center text-accent hover:bg-accent hover:text-white transition-colors"
                      aria-label={`WhatsApp ${member.name}`}
                    >
                      <IconBrandWhatsapp size={16} />
                    </a>
                  </>
                )}
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Options Context Sheet */}
      <BottomSheet
        isOpen={isMoreMenuOpen}
        onClose={() => setIsMoreMenuOpen(false)}
        title="Category Options"
      >
        <div className="space-y-1.5 pb-2">
          <button
            type="button"
            onClick={handleDeleteCategory}
            className="w-full flex items-center gap-3 p-3 rounded-card hover:bg-dangerTint text-left text-xs font-medium text-danger"
          >
            <IconTrash size={18} />
            <span>Delete Category</span>
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
